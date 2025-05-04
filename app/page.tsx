"use client"

import React, { useState, useRef, useEffect } from 'react'
import { storage } from '@/utils/firebase'
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage'
import { v4 as uuidv4 } from 'uuid'

export default function SARImageUpload() {
  const [originalImage, setOriginalImage] = useState<string | null>(null)
  const [colorizedImage, setColorizedImage] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [imageId, setImageId] = useState<string | null>(null)
  const [isDarkMode, setIsDarkMode] = useState<boolean>(false)
  const [sliderValue, setSliderValue] = useState<number>(50)
  const [category, setCategory] = useState<string>("0")
  const [showDescription, setShowDescription] = useState<boolean>(false)
  const fileInputRef = useRef<HTMLInputElement | null>(null)
  const compareRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    document.body.classList.toggle('dark', isDarkMode)
  }, [isDarkMode])

  useEffect(() => {
    if (compareRef.current && originalImage && colorizedImage) {
      compareRef.current.style.setProperty('--compare-position', `${sliderValue}%`)
    }
  }, [sliderValue, originalImage, colorizedImage])

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setIsLoading(true)
      const newImageId = uuidv4()
      setImageId(newImageId)
      const storageRef = ref(storage, `sar_images/${newImageId}`)

      try {
        await uploadBytes(storageRef, file)
        const downloadURL = await getDownloadURL(storageRef)
        setOriginalImage(downloadURL)
        setColorizedImage(null)
      } catch (error) {
        console.error("Error uploading image: ", error)
      } finally {
        setIsLoading(false)
      }
    }
  }

  const handleColorize = async () => {
    if (!originalImage || !imageId) {
      console.error('Image URL or ID is missing')
      return
    }

    setIsLoading(true)
    try {
      const response = await fetch('http://localhost:5000/colorize', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ imageId: imageId, category: parseInt(category) }),
      })

      if (!response.ok) {
        throw new Error('Colorization failed')
      }

      const data = await response.json()
      if (data.colorizedImage) {
        setColorizedImage(data.colorizedImage)
      } else {
        throw new Error('No colorizedImage found in the response')
      }
    } catch (error) {
      console.error("Error during colorization: ", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleDownload = () => {
    if (colorizedImage) {
      const link = document.createElement('a')
      link.href = colorizedImage
      link.download = 'colorized_sar_image.png'
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
    }
  }

  const handleReset = () => {
    setOriginalImage(null)
    setColorizedImage(null)
    setImageId(null)
    setSliderValue(50)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  return (
    <div className={`transition-colors duration-300 ${isDarkMode ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-900'}`}>
      <div className="max-w-6xl mx-auto px-4 py-8 mt-14">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden mb-8">
          <div className="p-6">
            <div className="flex justify-between items-center mb-8">
              <h1 className="text-3xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-pink-600">
                SAR Image Colorization
              </h1>
              <div className="flex items-center space-x-4">
                <button
                  onClick={() => setShowDescription(!showDescription)}
                  className="px-4 py-2 rounded-full bg-purple-500 text-white hover:bg-purple-600 transition duration-300"
                >
                  {showDescription ? 'Hide Info' : 'Show Info'}
                </button>
                <button
                  onClick={() => setIsDarkMode(!isDarkMode)}
                  className="p-2 rounded-full bg-gray-200 dark:bg-gray-700"
                  aria-label={isDarkMode ? "Switch to light mode" : "Switch to dark mode"}
                >
                  {isDarkMode ? '🌞' : '🌙'}
                </button>
              </div>
            </div>

            {showDescription && (
              <div className="mb-8 p-6 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl text-white shadow-lg transform hover:scale-105 transition-all duration-300">
                <h2 className="text-2xl font-bold mb-4">Unveiling the Invisible: SAR Image Colorization</h2>
                <p className="mb-4">
                  Welcome to the cutting-edge world of Synthetic Aperture Radar (SAR) image colorization! Our revolutionary web application harnesses the power of advanced AI to breathe life into grayscale SAR images, transforming them into vibrant, color-rich visualizations.
                </p>
                <p className="mb-4">
                  🚀 How it works:
                  <ol className="list-decimal list-inside pl-4">
                    <li>Upload your SAR image</li>
                    <li>Our AI analyzes the image's features and patterns</li>
                    <li>Select a terrain category to fine-tune the colorization</li>
                    <li>Watch as our neural network paints your image with stunning, realistic colors</li>
                    <li>Compare the original and colorized versions with our interactive slider</li>
                    <li>Download your newly colorized masterpiece!</li>
                  </ol>
                </p>
                <p>
                  Experience the magic of seeing through the eyes of AI, as it unveils hidden details and brings a new dimension to SAR imagery. Whether you're a researcher, a GIS professional, or simply curious about the unseen world around us, our SAR Image Colorizer opens up a whole new spectrum of possibilities!
                </p>
              </div>
            )}

            <div
              className="border-dashed border-2 border-gray-300 rounded-lg p-8 text-center mb-8 cursor-pointer hover:border-purple-400 transition duration-300 ease-in-out"
              onClick={() => fileInputRef.current?.click()}
            >
              <input
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
                ref={fileInputRef}
              />
              <svg className="mx-auto h-12 w-12 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48" aria-hidden="true">
                <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              <p className="mt-2 text-sm text-gray-500">Drag & drop an SAR image here, or click to select</p>
            </div>

            {originalImage && (
              <div className="space-y-4 mb-8">
                <div className="relative aspect-video overflow-hidden rounded-lg shadow-xl">
                  {colorizedImage ? (
                    <div ref={compareRef} className="compare">
                      <img src={originalImage} alt="Original SAR" className="absolute inset-0 w-full h-full object-cover" />
                      <img src={colorizedImage} alt="Colorized SAR" className="absolute inset-0 w-full h-full object-cover" />
                    </div>
                  ) : (
                    <img src={originalImage} alt="Original SAR" className="w-full h-full object-cover" />
                  )}
                </div>
                {colorizedImage && (
                  <div className="flex items-center space-x-2">
                    <label htmlFor="compare-slider" className="w-20 text-purple-500 font-semibold">Compare:</label>
                    <input
                      type="range"
                      id="compare-slider"
                      min="0"
                      max="100"
                      value={sliderValue}
                      onChange={(e) => setSliderValue(parseInt(e.target.value))}
                      className="w-full"
                    />
                  </div>
                )}
              </div>
            )}

            <div className="flex flex-col sm:flex-row justify-center items-center space-y-4 sm:space-y-0 sm:space-x-4">
              {originalImage && !colorizedImage && (
                <>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full sm:w-auto px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                  >
                    <option value="0">Agriculture</option>
                    <option value="1">Barren Land</option>
                    <option value="2">Grassland</option>
                    <option value="3">Urban</option>
                    <option value="4">Combined</option>
                  </select>
                  <button
                    onClick={handleColorize}
                    disabled={isLoading}
                    className="w-full sm:w-auto px-4 py-2 font-bold text-white bg-gradient-to-r from-purple-500 to-pink-500 rounded-md hover:from-purple-600 hover:to-pink-600 focus:outline-none focus:shadow-outline-purple active:bg-purple-800 transition duration-150 ease-in-out"
                  >
                    {isLoading ? 'Processing...' : 'Colorize Image'}
                  </button>
                </>
              )}
              {colorizedImage && (
                <button
                  onClick={handleDownload}
                  className="w-full sm:w-auto px-4 py-2 font-bold text-white bg-green-500 rounded-md hover:bg-green-600 focus:outline-none focus:shadow-outline-green active:bg-green-800 transition duration-150 ease-in-out"
                >
                  Download Colorized Image
                </button>
              )}
              <button
                onClick={handleReset}
                className="w-full sm:w-auto px-4 py-2 font-bold text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300 focus:outline-none focus:shadow-outline-gray active:bg-gray-400 transition duration-150 ease-in-out"
              >
                Reset
              </button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden">
            <div className="p-6">
              <h2 className="text-2xl font-bold mb-4 text-purple-500">How It Works</h2>
              <p className="text-gray-600 dark:text-gray-300">
                Our SAR Image Colorization tool uses state-of-the-art deep learning models to add realistic colors to grayscale Synthetic Aperture Radar images. The process involves analyzing the texture and patterns in the SAR image and mapping them to appropriate color schemes based on the selected terrain category.
              </p>
            </div>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden">
            <div className="p-6">
              <h2 className="text-2xl font-bold mb-4 text-purple-500">Applications</h2>
              <ul className="list-disc list-inside text-gray-600 dark:text-gray-300">
                <li>Environmental monitoring</li>
                <li>Urban planning and development</li>
                <li>Agricultural analysis</li>
                <li>Disaster response and management</li>
                <li>Geological surveys</li>
                <li>Military intelligence</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {isLoading && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-purple-500"></div>
        </div>
      )}

      <style jsx>{`
        .compare {
          --compare-position: 50%;
          position: relative;
          width: 100%;
          height: 100%;
          overflow: hidden;
        }
        .compare > img:last-child {
          clip-path: polygon(var(--compare-position) 0, 100% 0, 100% 100%, var(--compare-position) 100%);
        }
        .compare::before {
          content: '';
          position: absolute;
          top: 0;
          bottom: 0;
          left: var(--compare-position);
          width: 4px;
          background: white;
          z-index: 10;
        }
      `}</style>
    </div>
  )
}