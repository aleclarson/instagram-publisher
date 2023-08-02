import fs from 'fs';
import InstagramPublisher from '../src';
import { MAX_CAPTION_LENGTH } from '../src/config';
import {
  IMAGES_NOT_FOUND_ERR,
  IMAGES_NOT_JPG_ERR,
  IMAGES_WRONG_ASPECT_RATIO_ERR,
  MAX_10_IMAGES_ERR,
  MIN_2_IMAGES_ERR,
} from '../src/errors';
import { FILES_DIR, createImage } from './utils';

const IP = new InstagramPublisher({
  email: '',
  password: '',
});

beforeAll(() => {
  fs.writeFileSync(
    'cookies.json',
    JSON.stringify([
      {
        key: 'sessionid',
        expires: new Date('2100-09-11T12:56:18.000Z').toISOString(),
      },
    ])
  );
});

afterAll(() => {
  fs.rmdirSync(FILES_DIR, { recursive: true });
  fs.unlinkSync('cookies.json', () => {});
});

test('Ensure atleast 2 images are provided', async () => {
  await expect(
    async () =>
      await IP.createImageSlideshow({ images: ['./a.jpg'], caption: 'caption' })
  ).rejects.toThrowError(MIN_2_IMAGES_ERR);
});

test('Ensure caption does not exceed limit', async () => {
  const long_caption = new Array(MAX_CAPTION_LENGTH).join(',');

  await expect(
    async () =>
      await IP.createImageSlideshow({ images: [], caption: long_caption })
  ).rejects.toThrowError(MAX_CAPTION_LENGTH);
});

test('Ensure max 10 images are provided', async () => {
  await expect(
    async () =>
      await IP.createImageSlideshow({
        images: new Array(11),
        caption: 'caption',
      })
  ).rejects.toThrowError(MAX_10_IMAGES_ERR);
});

test('Ensure all images exists locally', async () => {
  const images = [
    './1.jpg',
    'https://kgo.googleusercontent.com/profile_vrt_raw_bytes_1587515358_10512.png',
  ];
  await expect(
    async () => await IP.createImageSlideshow({ images, caption: 'caption' })
  ).rejects.toThrowError(IMAGES_NOT_FOUND_ERR);
});

test('Ensure all images are JPG', async () => {
  const images: string[] = [];

  for (let i = 0; i < 3; i++) {
    await createImage(1000, 1000, `${i}.jpg`);
    images.push(`${FILES_DIR}/${i}.jpg`);
  }
  await createImage(1000, 1000, `${3}.png`);
  images.push(`${FILES_DIR}/${3}.png`);

  await expect(
    async () => await IP.createImageSlideshow({ images, caption: 'caption' })
  ).rejects.toThrowError(IMAGES_NOT_JPG_ERR);
});

test('Ensure all images with aspect ratio 1:1', async () => {
  const images: string[] = [];

  for (let i = 0; i < 3; i++) {
    await createImage(1000, 1000, `${i}.jpg`);
    images.push(`${FILES_DIR}/${i}.jpg`);
  }
  await createImage(200, 1000, `${3}.jpg`);
  images.push(`${FILES_DIR}/${3}.jpg`);

  await expect(
    async () => await IP.createImageSlideshow({ images, caption: 'caption' })
  ).rejects.toThrowError(IMAGES_WRONG_ASPECT_RATIO_ERR);
});
