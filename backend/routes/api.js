const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const courseController = require('../controllers/courseController');
const mentorController = require('../controllers/mentorController');
const contactController = require('../controllers/contactController');
const commentController = require('../controllers/commentController');
const settingController = require('../controllers/settingController');
const authMiddleware = require('../middleware/authMiddleware');
const { optionalAuth } = authMiddleware;
const uploadMiddleware = require('../middleware/uploadMiddleware');
const { apiLimiter, loginLimiter, registerLimiter, contactLimiter, videoLimiter, adminOnly } = require('../middleware/security');

// Global API rate limit - skip for admins
router.use(optionalAuth);
router.use(apiLimiter);

// Auth - rate limited
router.post('/auth/login', loginLimiter, authController.login);
router.post('/auth/register', registerLimiter, authController.register);
router.post('/auth/forgot-password', authController.forgotPassword);
router.post('/auth/reset-password/:token', authController.resetPassword);
router.post('/auth/sessions/delete', authController.deleteSession);
router.get('/auth/me', authMiddleware, authController.getMe);
router.patch('/auth/update-profile', authMiddleware, authController.updateMyProfile);
router.get('/users', authMiddleware, adminOnly, authController.getAllUsers);
router.patch('/users/:id/reset-password', authMiddleware, adminOnly, authController.updateUserPassword);
router.delete('/users/:id', authMiddleware, adminOnly, authController.deleteUser);

// Courses
router.get('/courses', courseController.getAllCourses);
router.get('/courses/:id', courseController.getCourseById);
router.post('/courses', authMiddleware, adminOnly, uploadMiddleware.single('image'), courseController.createCourse);
router.patch('/courses/:id', authMiddleware, adminOnly, uploadMiddleware.single('image'), courseController.updateCourse);
router.delete('/courses/:id', authMiddleware, adminOnly, courseController.deleteCourse);

// Mentors
router.get('/mentors', mentorController.getAllMentors);
router.post('/mentors', authMiddleware, adminOnly, uploadMiddleware.single('image'), mentorController.createMentor);
router.patch('/mentors/:id', authMiddleware, adminOnly, uploadMiddleware.single('image'), mentorController.updateMentor);
router.delete('/mentors/:id', authMiddleware, adminOnly, mentorController.deleteMentor);

// Contact - rate limited
router.get('/contacts', authMiddleware, adminOnly, contactController.getAllContacts);
router.post('/contacts', contactLimiter, contactController.createContact);
router.delete('/contacts/:id', authMiddleware, adminOnly, contactController.deleteContact);

// Comments / Reviews
router.get('/comments', commentController.getAllComments);
router.post('/comments', authMiddleware, adminOnly, uploadMiddleware.single('image'), commentController.createComment);
router.patch('/comments/:id', authMiddleware, adminOnly, uploadMiddleware.single('image'), commentController.updateComment);
router.delete('/comments/:id', authMiddleware, adminOnly, commentController.deleteComment);

// Settings
router.get('/settings', settingController.getAllSettings);
router.post('/settings', authMiddleware, adminOnly, uploadMiddleware.any(), settingController.updateSettings);

// Lessons (Admin CRUD & streaming)
router.get('/courses/:courseId/lessons', authMiddleware, courseController.getLessons);
router.post('/courses/:courseId/lessons/:lessonId/complete', authMiddleware, courseController.markLessonCompleted);
router.post('/lessons', authMiddleware, adminOnly, uploadMiddleware.single('video'), courseController.createLesson);
router.patch('/lessons/:id', authMiddleware, adminOnly, uploadMiddleware.single('video'), courseController.updateLesson);
router.delete('/lessons/:id', authMiddleware, adminOnly, courseController.deleteLesson);

// Secure Video Streaming — faqat autentifikatsiya bilan
router.get('/videos/:filename', authMiddleware, courseController.streamVideo);

// Enrollments (Admin only)
router.get('/enrollments', authMiddleware, adminOnly, courseController.getEnrollments);
router.post('/enrollments', authMiddleware, adminOnly, courseController.enrollUser);
router.delete('/enrollments/:id', authMiddleware, adminOnly, courseController.deleteEnrollment);

// Student specific
router.get('/my-courses', authMiddleware, courseController.getMyCourses);

const contentController = require('../controllers/contentController');

// NEWS
router.get('/news', contentController.getNews);
router.post('/news', authMiddleware, adminOnly, uploadMiddleware.single('image'), contentController.createNews);
router.delete('/news/:id', authMiddleware, adminOnly, contentController.deleteNews);

// GALLERY
router.get('/gallery', contentController.getGallery);
router.post('/gallery', authMiddleware, adminOnly, uploadMiddleware.single('image'), contentController.uploadGallery);
router.delete('/gallery/:id', authMiddleware, adminOnly, contentController.deleteGallery);

module.exports = router;
