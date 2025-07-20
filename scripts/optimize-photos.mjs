#!/usr/bin/env node

import { readdir, readFile, writeFile, mkdir } from 'fs/promises';
import { join, dirname, basename, extname } from 'path';
import { fileURLToPath } from 'url';
import sharp from 'sharp';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const projectRoot = join(__dirname, '..');

// 图片优化配置
const SIZES = {
  thumbnail: { width: 400, height: 400 },
  medium: { width: 800, height: 800 },
  large: { width: 1200, height: 1200 },
  lightbox: { width: 1920, height: 1080 },
};

const FORMATS = ['webp', 'avif', 'jpeg'];
const QUALITY = {
  thumbnail: 75,
  medium: 85,
  large: 90,
  lightbox: 95,
};

/**
 * 优化单张图片
 */
async function optimizeImage(inputPath, outputDir, filename, size, format) {
  try {
    const { width, height } = SIZES[size];
    const quality = QUALITY[size];
    
    const outputPath = join(outputDir, `${filename}-${size}.${format}`);
    
    await sharp(inputPath)
      .resize(width, height, {
        fit: 'cover',
        position: 'center',
      })
      .toFormat(format, { quality })
      .toFile(outputPath);
    
    console.log(`✓ Generated: ${outputPath}`);
    return outputPath;
  } catch (error) {
    console.error(`✗ Failed to optimize ${inputPath} to ${size}.${format}:`, error.message);
    return null;
  }
}

/**
 * 处理照片目录
 */
async function processPhotosDirectory() {
  const photosDir = join(projectRoot, 'src/assets/photos');
  const optimizedDir = join(projectRoot, 'src/assets/photos/optimized');
  
  try {
    // 创建优化图片目录
    await mkdir(optimizedDir, { recursive: true });
    
    // 读取照片目录
    const files = await readdir(photosDir);
    const imageFiles = files.filter(file => 
      /\.(jpg|jpeg|png|webp)$/i.test(file)
    );
    
    console.log(`Found ${imageFiles.length} images to optimize...`);
    
    for (const file of imageFiles) {
      const inputPath = join(photosDir, file);
      const filename = basename(file, extname(file));
      
      console.log(`\nProcessing: ${file}`);
      
      // 为每个尺寸和格式生成优化版本
      for (const size of Object.keys(SIZES)) {
        for (const format of FORMATS) {
          await optimizeImage(inputPath, optimizedDir, filename, size, format);
        }
      }
    }
    
    console.log('\n✅ Photo optimization completed!');
  } catch (error) {
    console.error('❌ Error processing photos:', error);
  }
}

/**
 * 更新照片数据文件
 */
async function updatePhotoDataFiles() {
  const photosContentDir = join(projectRoot, 'src/content/photos');
  
  try {
    const files = await readdir(photosContentDir);
    const jsonFiles = files.filter(file => file.endsWith('.json'));
    
    console.log(`\nUpdating ${jsonFiles.length} photo data files...`);
    
    for (const file of jsonFiles) {
      const filePath = join(photosContentDir, file);
      const content = await readFile(filePath, 'utf-8');
      const photoData = JSON.parse(content);
      
      // 获取原始图片文件名
      const imagePath = photoData.image;
      const filename = basename(imagePath, extname(imagePath));
      
      // 添加优化版本的路径
      photoData.formats = {
        webp: `/src/assets/photos/optimized/${filename}-thumbnail.webp`,
        avif: `/src/assets/photos/optimized/${filename}-thumbnail.avif`,
        jpeg: `/src/assets/photos/optimized/${filename}-thumbnail.jpeg`,
      };
      
      photoData.sizes = {
        thumbnail: SIZES.thumbnail,
        medium: SIZES.medium,
        large: SIZES.large,
      };
      
      photoData.quality = 85;
      photoData.priority = false;
      
      // 如果没有缩略图，设置优化后的缩略图
      if (!photoData.thumbnail) {
        photoData.thumbnail = photoData.formats.webp;
      }
      
      // 写回文件
      await writeFile(filePath, JSON.stringify(photoData, null, 2));
      console.log(`✓ Updated: ${file}`);
    }
    
    console.log('\n✅ Photo data files updated!');
  } catch (error) {
    console.error('❌ Error updating photo data files:', error);
  }
}

/**
 * 生成图片清单文件
 */
async function generateImageManifest() {
  const manifestPath = join(projectRoot, 'src/assets/photos/manifest.json');
  const optimizedDir = join(projectRoot, 'src/assets/photos/optimized');
  
  try {
    const files = await readdir(optimizedDir);
    const manifest = {};
    
    files.forEach(file => {
      const [filename, size, format] = file.split(/[-\.]/);
      
      if (!manifest[filename]) {
        manifest[filename] = {};
      }
      
      if (!manifest[filename][size]) {
        manifest[filename][size] = {};
      }
      
      manifest[filename][size][format] = `/src/assets/photos/optimized/${file}`;
    });
    
    await writeFile(manifestPath, JSON.stringify(manifest, null, 2));
    console.log('✅ Image manifest generated!');
  } catch (error) {
    console.error('❌ Error generating manifest:', error);
  }
}

/**
 * 主函数
 */
async function main() {
  console.log('🚀 Starting photo optimization...\n');
  
  // 检查 Sharp 是否可用
  try {
    await sharp({ create: { width: 1, height: 1, channels: 3, background: 'white' } })
      .png()
      .toBuffer();
    console.log('✅ Sharp is available\n');
  } catch (error) {
    console.error('❌ Sharp is not available. Please install it with: npm install sharp');
    process.exit(1);
  }
  
  await processPhotosDirectory();
  await updatePhotoDataFiles();
  await generateImageManifest();
  
  console.log('\n🎉 All done! Your photos have been optimized.');
  console.log('\nNext steps:');
  console.log('1. Review the optimized images in src/assets/photos/optimized/');
  console.log('2. Update your photo data files if needed');
  console.log('3. Test the photo gallery to ensure everything works correctly');
}

// 运行脚本
if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(console.error);
}

export { optimizeImage, processPhotosDirectory, updatePhotoDataFiles, generateImageManifest };