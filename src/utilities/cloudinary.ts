// Require the cloudinary library
// const fs = require('fs');
// const ffmpeg = require('fluent-ffmpeg');
import { v2 as cloudinary } from "cloudinary";
import sharp from "sharp";

// Return "https" URLs by setting secure: true
cloudinary.config({
    secure: true,
});

// Log the configuration
console.log("===>> Cloudinary config detected");

export const uploadToCloudinary = async (content: string, type: string, base64: string, preset: string, public_id: string) => {
    let result;
    if (content === "image") {
        // Compress the image before uploading
        const compressedImage = await compressImage(base64);

        // Upload the image to Cloudinary
        // result = await cloudinary.uploader.upload(`data:${content}/${type};base64,${base64}`, {
        result = await cloudinary.uploader.upload(`data:${content}/${type};base64,${compressedImage}`, {
            upload_preset: preset,
            public_id: public_id,
        });
    } else if (content === "video") {
        // Compress the video before uploading
        // const compressedVideo = await compressVideo(base64);

        // Upload the compressed video to Cloudinary
        result = await cloudinary.uploader.upload(`data:${content}/${type};base64,${base64}`, {
            upload_preset: preset,
            public_id: public_id,
            resource_type: "video",
        });
    } else {
        // Unsupported file type, throw an error or handle appropriately
        throw new Error("Unsupported file type");
    }

    return result;
};

const compressImage = async (base64: string) => {
    // Compress the image using a compression library or algorithm
    // For example, you can use a library like 'sharp' or 'imagemin'
    // Here's a sample code using 'sharp' library:
    const compressedBuffer = await sharp(Buffer.from(base64, "base64"))
        .png({ quality: 60 }) // Adjust the quality value as needed
        .toBuffer();

    // Convert the compressed image buffer back to base64
    const compressedImage = compressedBuffer.toString("base64");
    return compressedImage;
};

// const compressVideo = async (base64: string) => {
//     // Compress the video using a compression library or algorithm
//     // For example, you can use a library like 'ffmpeg' or 'video-compressor'
//     // Here's a sample code using 'cloudinary' library:
//     const compressedVideo = await cloudinary.uploader.upload_large(base64, {
//         resource_type: "video",
//         eager: [
//             { format: "mp4", transformation: [{ width: 640 }] },
//             { format: "webm", transformation: [{ width: 640 }] }
//         ]
//     });

//     // Get the URL of the compressed video
//     const compressedVideoURL = compressedVideo;
//     // const compressedVideoURL = compressedVideo.eager[0].secure_url;
//     return compressedVideoURL;
// };

// const compressVideo = async (base64: string) => {
//     // Write the base64 data to a temporary file
//     fs.writeFileSync('temp.mp4', base64, { encoding: 'base64' });

//     return new Promise((resolve, reject) => {
//         ffmpeg('temp.mp4')
//             .outputOptions('-c:v', 'libx264', '-c:a', 'aac', '-vf', 'scale=640:-1', '-r', '24')
//             .output('output.mp4')
//             .on('end', () => {
//                 // Read the compressed file back into a base64 string
//                 const compressedVideo = fs.readFileSync('output.mp4', { encoding: 'base64' });
//                 resolve(compressedVideo);

//                 // Optionally, delete the temporary files
//                 fs.unlinkSync('temp.mp4');
//                 fs.unlinkSync('output.mp4');
//             })
//             .on('error', reject)
//             .run();
//     });
// };

// const compressVideo = async (base64: string) => {
//     // Compress the image using a compression library or algorithm
//     // For example, you can use a library like 'sharp' or 'imagemin'
//     // Here's a sample code using 'sharp' library:

//     const convertedVideo = await ffmpeg(Buffer.from(base64, 'base64'))
//         .withVideoCodec('libx264') // Set the video codec
//         .withAudioCodec('libfaac') // Set the audio codec
//         .withSize('640x?') // Set the output video size
//         .withFps(24) // Set the output video frames per second (FPS)
//         .toFormat('mp4') // Set the output video format
//         .toBuffer();
//         // Convert the compressed image buffer back to base64
//     console.log('Converted Video', convertedVideo);

//     const compressedVideo = convertedVideo.toString('base64');
//     return compressedVideo;
// };
