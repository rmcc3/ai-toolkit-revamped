import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { getDatasetsRoot, getTrainingFolder } from '@/server/settings';

function isWithinRoot(targetPath: string, rootPath: string) {
  const relativePath = path.relative(rootPath, targetPath);
  return relativePath && !relativePath.startsWith('..') && !path.isAbsolute(relativePath);
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { imgPath } = body;

    if (typeof imgPath !== 'string') {
      return NextResponse.json({ error: 'Invalid image path' }, { status: 400 });
    }

    const datasetsPath = path.resolve(await getDatasetsRoot());
    const trainingPath = path.resolve(await getTrainingFolder());
    const resolvedImgPath = path.resolve(imgPath);

    // make sure the dataset/training path contains the image path
    if (!isWithinRoot(resolvedImgPath, datasetsPath) && !isWithinRoot(resolvedImgPath, trainingPath)) {
      return NextResponse.json({ error: 'Invalid image path' }, { status: 400 });
    }

    // make sure it is an image
    if (!/\.(jpg|jpeg|png|bmp|gif|tiff|webp|mp4|mp3|wav|flac|ogg)$/i.test(resolvedImgPath.toLowerCase())) {
      return NextResponse.json({ error: 'Not an image' }, { status: 400 });
    }

    // if img doesnt exist, ignore
    if (!fs.existsSync(resolvedImgPath)) {
      return NextResponse.json({ success: true });
    }

    // delete it and return success
    fs.unlinkSync(resolvedImgPath);

    // check for caption
    const captionPath = resolvedImgPath.replace(/\.[^/.]+$/, '') + '.txt';
    if (isWithinRoot(captionPath, datasetsPath) || isWithinRoot(captionPath, trainingPath)) {
      if (fs.existsSync(captionPath)) {
        // delete caption file
        fs.unlinkSync(captionPath);
      }
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create dataset' }, { status: 500 });
  }
}
