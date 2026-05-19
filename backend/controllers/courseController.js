const Course = require('../models/Course');
const Lesson = require('../models/Lesson');
const Enrollment = require('../models/Enrollment');
const User = require('../models/User');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

exports.getAllCourses = async (req, res) => {
  try {
    const courses = await Course.findAll({
      include: [{
        model: Lesson,
        attributes: ['id'] // Faqat darslar sonini olish uchun
      }]
    });
    // Har bir kursga darslar sonini qo'shish
    const coursesWithCount = courses.map(c => {
      const plain = c.toJSON();
      plain.lessonsCount = plain.Lessons ? plain.Lessons.length : 0;
      delete plain.Lessons;
      return plain;
    });
    res.json(coursesWithCount);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching courses', error: error.message });
  }
};

exports.getCourseById = async (req, res) => {
  try {
    const course = await Course.findByPk(req.params.id, {
      include: [{
        model: Lesson,
        attributes: ['id']
      }]
    });
    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }
    const plain = course.toJSON();
    plain.lessonsCount = plain.Lessons ? plain.Lessons.length : 0;
    delete plain.Lessons;
    res.json(plain);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching course', error: error.message });
  }
};

exports.createCourse = async (req, res) => {
  const { title, description, price, category } = req.body;
  const image = req.file ? req.file.path : null;
  try {
    const freshCourse = await Course.create({ title, description, price, image, category });
    res.status(201).json(freshCourse);
  } catch (error) {
    res.status(500).json({ message: 'Error creating course', error: error.message });
  }
};

exports.updateCourse = async (req, res) => {
  const { title, description, price, category } = req.body;
  const image = req.file ? req.file.path : undefined;
  try {
    const course = await Course.findByPk(req.params.id);
    if (!course) return res.status(404).json({ message: 'Not found' });
    
    if (image && course.image) {
      if (fs.existsSync(course.image)) fs.unlinkSync(course.image);
    }

    await course.update({ 
      title: title || course.title, 
      description: description || course.description, 
      price: price || course.price, 
      category: category || course.category,
      image: image !== undefined ? image : course.image 
    });
    res.json(course);
  } catch (error) {
    res.status(500).json({ message: 'Error updating course', error: error.message });
  }
};

exports.deleteCourse = async (req, res) => {
  try {
    const course = await Course.findByPk(req.params.id);
    if (!course) return res.status(404).json({ message: 'Not found' });
    
    // Kurs rasmini o'chirish
    if (course.image && fs.existsSync(course.image)) fs.unlinkSync(course.image);
    
    // Kursga tegishli darslarni o'chirish
    const lessons = await Lesson.findAll({ where: { courseId: course.id } });
    for (const lesson of lessons) {
      if (lesson.videoType === 'file' && lesson.videoUrl) {
        const filePath = path.join(__dirname, '../private_uploads/videos/', lesson.videoUrl);
        if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
      }
      await lesson.destroy();
    }
    
    // Enrollmentlarni o'chirish
    await Enrollment.destroy({ where: { courseId: course.id } });
    
    await course.destroy();
    res.json({ message: 'Course deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting course', error: error.message });
  }
};

// Lessons
exports.getLessons = async (req, res) => {
  try {
    const courseId = req.params.courseId;
    const lessons = await Lesson.findAll({ 
      where: { courseId: courseId },
      order: [['order', 'ASC']]
    });

    // Foydalanuvchining progressini olish
    let completedLessons = [];
    if (req.user && req.user.role !== 'admin') {
      const enrollment = await Enrollment.findOne({ where: { userId: req.user.id, courseId: courseId } });
      if (enrollment && enrollment.completedLessons) {
        let rawCompleted = enrollment.completedLessons;
        if (typeof rawCompleted === 'string') {
          try {
            rawCompleted = JSON.parse(rawCompleted);
          } catch (e) {
            rawCompleted = [];
          }
        }
        if (Array.isArray(rawCompleted)) {
          completedLessons = rawCompleted.map(Number);
        }
      }
    }

    // Darslarga isCompleted xususiyatini qo'shish
    const plainLessons = lessons.map((l) => {
      const plain = l.toJSON();
      plain.isCompleted = Array.isArray(completedLessons) && completedLessons.includes(Number(plain.id));
      return plain;
    });

    res.json({ lessons: plainLessons, completedLessons });
  } catch (error) {
    res.status(500).json({ message: 'Darslarni yuklashda xatolik', error: error.message });
  }
};

exports.markLessonCompleted = async (req, res) => {
  try {
    const { courseId, lessonId } = req.params;
    
    if (req.user.role === 'admin') return res.json({ message: 'Admin doim 100% progressga ega' });

    const enrollment = await Enrollment.findOne({ where: { userId: req.user.id, courseId: courseId } });
    if (!enrollment) return res.status(403).json({ message: 'Siz ushbu kursga a\'zo emassiz' });

    let completed = enrollment.completedLessons || [];
    if (typeof completed === 'string') {
      try {
        completed = JSON.parse(completed);
      } catch (e) {
        completed = [];
      }
    }
    if (!Array.isArray(completed)) {
      completed = [];
    }
    completed = completed.map(Number);

    if (!completed.includes(Number(lessonId))) {
      completed.push(Number(lessonId));
      
      const totalLessons = await Lesson.count({ where: { courseId: courseId } });
      const newStatus = completed.length >= totalLessons ? 'completed' : enrollment.status;
      
      await enrollment.update({ 
        completedLessons: completed,
        status: newStatus
      });
    }

    res.json({ message: 'Dars yakunlandi', completedLessons: completed });
  } catch (error) {
    res.status(500).json({ message: 'Progressni saqlashda xatolik', error: error.message });
  }
};

exports.createLesson = async (req, res) => {
  try {
    const { title, courseId, order, videoType, videoUrl: externalUrl } = req.body;
    let finalVideoUrl = externalUrl;
    let finalVideoType = videoType || 'url';

    if (req.file) {
      finalVideoUrl = req.file.filename;
      finalVideoType = 'file';
    }

    const lesson = await Lesson.create({
      title,
      courseId: Number(courseId),
      order: Number(order) || 0,
      videoType: finalVideoType,
      videoUrl: finalVideoUrl
    });
    res.status(201).json(lesson);
  } catch (error) {
    res.status(500).json({ message: 'Dars yaratishda xatolik', error: error.message });
  }
};

exports.updateLesson = async (req, res) => {
  try {
    const lesson = await Lesson.findByPk(req.params.id);
    if (!lesson) return res.status(404).json({ message: 'Dars topilmadi' });
    
    const updateData = { ...req.body };
    
    if (req.file) {
      // Eski video faylni o'chirish
      if (lesson.videoType === 'file' && lesson.videoUrl) {
        const oldPath = path.join(__dirname, '../private_uploads/videos/', lesson.videoUrl);
        if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
      }
      updateData.videoUrl = req.file.filename;
      updateData.videoType = 'file';
    }
    
    await lesson.update(updateData);
    res.json(lesson);
  } catch (error) {
    res.status(500).json({ message: 'Darsni yangilashda xatolik', error: error.message });
  }
};

exports.deleteLesson = async (req, res) => {
  try {
    const lesson = await Lesson.findByPk(req.params.id);
    if (!lesson) return res.status(404).json({ message: 'Dars topilmadi' });

    // If it's a file, delete it from disk
    if (lesson.videoType === 'file' && lesson.videoUrl) {
      const filePath = path.join(__dirname, '../private_uploads/videos/', lesson.videoUrl);
      if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
    }

    await lesson.destroy();
    res.json({ message: 'Dars o\'chirildi' });
  } catch (error) {
    res.status(500).json({ message: 'Darsni o\'chirishda xatolik', error: error.message });
  }
};

// Enrollments
exports.getEnrollments = async (req, res) => {
  const { userId } = req.query;
  try {
    const where = {};
    if (userId) where.userId = userId;

    const enrollments = await Enrollment.findAll({ 
      where,
      include: [
        { model: Course, attributes: ['title', 'image'] },
        { model: User, attributes: ['fullName', 'phone'] }
      ]
    });
    res.json(enrollments);
  } catch (error) {
    res.status(500).json({ message: 'Ro\'yxatni yuklashda xatolik', error: error.message });
  }
};

exports.enrollUser = async (req, res) => {
  try {
    // Takroriy enrollment tekshiruvi
    const exists = await Enrollment.findOne({
      where: { userId: req.body.userId, courseId: req.body.courseId }
    });
    if (exists) {
      return res.status(400).json({ message: 'Talaba allaqachon bu kursga a\'zo' });
    }
    
    const enrollment = await Enrollment.create(req.body);
    res.status(201).json(enrollment);
  } catch (error) {
    res.status(500).json({ message: 'Kursga qo\'shishda xatolik', error: error.message });
  }
};

exports.deleteEnrollment = async (req, res) => {
  try {
    const enrollment = await Enrollment.findByPk(req.params.id);
    if (!enrollment) return res.status(404).json({ message: 'Topilmadi' });
    await enrollment.destroy();
    res.json({ message: 'O\'chirildi' });
  } catch (error) {
    res.status(500).json({ message: 'O\'chirishda xatolik', error: error.message });
  }
};

// Student specific
exports.getMyCourses = async (req, res) => {
  try {
    const enrollments = await Enrollment.findAll({ 
      where: { userId: req.user.id },
      include: [Course]
    });
    
    const courses = [];
    for (const e of enrollments) {
        if (!e.Course) continue;
        const plainCourse = e.Course.toJSON();
        const activeLessons = await Lesson.findAll({ where: { courseId: plainCourse.id }, attributes: ['id'] });
        const activeLessonIds = activeLessons.map(l => Number(l.id));
        
        let completedArr = [];
        if (e.completedLessons) {
          if (Array.isArray(e.completedLessons)) {
            completedArr = e.completedLessons;
          } else if (typeof e.completedLessons === 'string') {
            try {
              completedArr = JSON.parse(e.completedLessons);
            } catch (pErr) {
              completedArr = [];
            }
          }
        }
        if (!Array.isArray(completedArr)) {
          completedArr = [];
        }

        const completedCount = completedArr.filter(id => activeLessonIds.includes(Number(id))).length;
          
        plainCourse.progress = activeLessonIds.length > 0 
          ? Math.round((completedCount / activeLessonIds.length) * 100) 
          : 0;
        courses.push(plainCourse);
    }
    
    res.json(courses);
  } catch (error) {
    res.status(500).json({ message: 'Kurslarni yuklashda xatolik', error: error.message });
  }
};

// ==========================================
// 🔒 XAVFSIZ VIDEO STREAMING
// Videolarni faqat ro'yxatdan o'tgan va 
// kursga a'zo talabalar ko'ra oladi
// Download qilish TAQIQLANGAN
// ==========================================
exports.streamVideo = async (req, res) => {
  const { filename } = req.params;
  
  // Path traversal himoyasi
  const safeFilename = path.basename(filename);
  const filePath = path.join(__dirname, '../private_uploads/videos/', safeFilename);

  try {
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ message: 'Video topilmadi' });
    }

    // Security check: dars mavjudligini tekshirish
    const lesson = await Lesson.findOne({ where: { videoUrl: safeFilename, videoType: 'file' } });
    if (!lesson) return res.status(404).json({ message: 'Dars topilmadi' });

    // Admin yoki kursga a'zo talaba tekshiruvi
    if (req.user.role !== 'admin') {
      const enrollment = await Enrollment.findOne({ 
        where: { userId: req.user.id, courseId: lesson.courseId } 
      });
      if (!enrollment) return res.status(403).json({ message: 'Ushbu darsga ruxsatingiz yo\'q' });
    }

    const stat = fs.statSync(filePath);
    const fileSize = stat.size;
    const range = req.headers.range;

    // 🔒 Anti-download headerlar
    res.setHeader('Content-Disposition', 'inline'); // Download o'rniga inline
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, private');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');
    
    // Range request (video seek uchun kerak)
    if (range) {
      const parts = range.replace(/bytes=/, "").split("-");
      const start = parseInt(parts[0], 10);
      const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;
      
      const chunksize = (end - start) + 1;
      const file = fs.createReadStream(filePath, { start, end });
      const head = {
        'Content-Range': `bytes ${start}-${end}/${fileSize}`,
        'Accept-Ranges': 'bytes',
        'Content-Length': chunksize,
        'Content-Type': 'video/mp4',
      };
      res.writeHead(206, head);
      file.pipe(res);
    } else {
      const head = {
        'Content-Length': fileSize,
        'Content-Type': 'video/mp4',
      };
      res.writeHead(200, head);
      fs.createReadStream(filePath).pipe(res);
    }
  } catch (error) {
    res.status(500).json({ message: 'Video oqimida xatolik', error: error.message });
  }
};
