import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { getDatasetsRoot } from '@/server/settings';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name } = body;
    if (typeof name !== 'string' || name.trim() === '') {
      return NextResponse.json({ error: 'Invalid dataset name' }, { status: 400 });
    }

    let datasetsPath = await getDatasetsRoot();
    const datasetsRootPath = path.resolve(datasetsPath);
    const datasetPath = path.resolve(datasetsRootPath, name);
    const relativePath = path.relative(datasetsRootPath, datasetPath);

    if (
      relativePath === '' ||
      relativePath === '.' ||
      relativePath.startsWith('..') ||
      path.isAbsolute(relativePath)
    ) {
      return NextResponse.json({ error: 'Invalid dataset name' }, { status: 400 });
    }

    // if folder doesnt exist, ignore
    if (!fs.existsSync(datasetPath)) {
      return NextResponse.json({ success: true });
    }

    // delete it and return success
    fs.rmSync(datasetPath, { recursive: true, force: true });
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete dataset' }, { status: 500 });
  }
}
