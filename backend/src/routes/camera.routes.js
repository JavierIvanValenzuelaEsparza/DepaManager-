// backend/src/routes/camera.routes.js
const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const cameraController = require('../controllers/camera.controller');

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/plates');
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const ext = path.extname(file.originalname);
        cb(null, 'plate-' + uniqueSuffix + ext);
    }
});

const memoryStorage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];

    if (allowedTypes.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(new Error('Tipo de archivo no permitido. Solo se aceptan imágenes (JPEG, PNG, WebP)'), false);
    }
};

const upload = multer({
    storage: storage,
    limits: {
        fileSize: 10 * 1024 * 1024
    },
    fileFilter: fileFilter
});

const uploadTemp = multer({
    storage: memoryStorage,
    limits: {
        fileSize: 10 * 1024 * 1024
    },
    fileFilter: fileFilter
});

router.post('/test-detect', uploadTemp.single('image'), cameraController.testPlateDetection);

router.post('/test-multi-ocr', uploadTemp.single('image'), cameraController.testMultiOCR);

router.post('/detect', upload.single('image'), cameraController.uploadAndDetect);

router.post('/detect-multi', uploadTemp.single('image'), cameraController.uploadAndDetectMulti);

router.get('/detections', cameraController.getDetections);

router.get('/detections/:id', cameraController.getDetectionById);

router.put('/detections/:id', cameraController.updateDetectionStatus);

router.delete('/detections/:id', cameraController.deleteDetection);

router.post('/rtsp/start', cameraController.startRTSP);

router.post('/rtsp/stop', cameraController.stopRTSP);

router.get('/rtsp/status', cameraController.statusRTSP);

router.get('/rtsp/diagnose', cameraController.diagnoseRTSP);

module.exports = router;
