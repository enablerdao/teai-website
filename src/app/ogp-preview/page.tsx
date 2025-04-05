'use client';

import Image from 'next/image';

const ogpImages = [
  { src: '/ogp-image-1.svg', alt: 'OGP Design 1', description: 'Refined Current Design' },
  { src: '/ogp-image-2.svg', alt: 'OGP Design 2', description: 'Circuit Background' },
  { src: '/ogp-image-3.svg', alt: 'OGP Design 3', description: 'Top/Bottom Split' },
  { src: '/ogp-image-4.svg', alt: 'OGP Design 4', description: 'Geometric Elements' },
  { src: '/ogp-image-5.svg', alt: 'OGP Design 5', description: 'Minimal Gradient' },
  { src: '/ogp-image-6.svg', alt: 'OGP Design 6', description: 'Minimal + Wave Gradient (Te🖐️AI.io)' },
  { src: '/ogp-image-7.svg', alt: 'OGP Design 7', description: 'Building Blocks (Te🖐️AI.io)' },
  { src: '/ogp-image-8.svg', alt: 'OGP Design 8', description: 'Spotlight (Te🖐️AI.io)' },
  { src: '/ogp-image-9.svg', alt: 'OGP Design 9', description: 'Subtle Icons Background (Te🖐️AI.io)' },
  { src: '/ogp-image-10.svg', alt: 'OGP Design 10', description: 'Abstract Flow (Te🖐️AI.io)' },
];

export default function OgpPreviewPage() {
  return (
    <div className="container mx-auto px-4 py-8 bg-gray-50">
      <h1 className="text-4xl font-bold mb-10 text-center text-gray-800">OGP Image Preview</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
        {ogpImages.map((image, index) => (
          <div key={index} className="border rounded-xl shadow-lg overflow-hidden bg-white flex flex-col">
            <div className="p-5 border-b bg-white">
              <h2 className="text-xl font-semibold mb-1 text-gray-700">Design {index + 1}: {image.description}</h2>
              <p className="text-sm text-gray-500">Filename: <code>{image.src}</code></p>
            </div>
            <div className="aspect-[1200/630] w-full bg-gray-100 flex items-center justify-center overflow-hidden">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img 
                src={image.src} 
                alt={image.alt} 
                width={600}
                height={315}
                className="w-full h-full object-contain"
                loading="lazy"
              />
            </div>
             <div className="p-3 bg-gray-100 text-center">
               <p className="text-xs text-gray-600 italic">
                 Actual size: 1200x630. Preview might differ.
               </p>
             </div>
          </div>
        ))}
      </div>
    </div>
  );
} 