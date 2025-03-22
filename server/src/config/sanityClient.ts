import { createClient } from '@sanity/client'
import dotenv from 'dotenv'

dotenv.config()

export const sanityClient = createClient({
  projectId: process.env.SANITY_PROJECT_ID || '',
  dataset: process.env.SANITY_DATASET || 'production',
  useCdn: process.env.NODE_ENV === 'production',
  apiVersion: '2024-03-17', // Use today's date or the latest API version
  token: process.env.SANITY_API_TOKEN // Only needed if you want to update content
})

export default sanityClient 