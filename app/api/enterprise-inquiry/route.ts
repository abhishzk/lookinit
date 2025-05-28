import { NextResponse } from 'next/server';
import { z } from 'zod'; // For validation
import { Ratelimit } from '@upstash/ratelimit'; // For rate limiting
import { Redis } from '@upstash/redis'; // Redis client for rate limiting
import nodemailer from 'nodemailer'; // For email notifications
import { CONFIG } from '@/lib/config'; // Add this import

// import { PrismaClient } from '@prisma/client'; // For database integration
// import { createPool } from '@prisma/connection-pool';

// Specify Node.js runtime
export const runtime = 'nodejs';

// // For serverless environments, use connection pooling
// const prismaClientSingleton = () => {
//   return new PrismaClient();
// };

// const globalForPrisma = globalThis as unknown as {
//   prisma: PrismaClient | undefined;
// };

// const prisma = globalForPrisma.prisma ?? prismaClientSingleton();

// if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;

// Initialize Redis client for rate limiting
// You'll need to add UPSTASH_REDIS_REST_URL and UPSTASH_REDIS_REST_TOKEN to your environment variables
const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL || '',
  token: process.env.UPSTASH_REDIS_REST_TOKEN || '',
});

// Create a rate limiter that allows 5 requests per minute
const ratelimit = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(5, '1 m'),
  analytics: true,
});

// Create a schema for form validation using Zod
const inquirySchema = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters long" }),
  email: z.string().email({ message: "Invalid email address" }),
  company: z.string().min(1, { message: "Company name is required" }),
  phone: z.string().optional(),
  jobTitle: z.string().optional(),
  inquiryType: z.string().optional(),
  message: z.string().min(10, { message: "Message must be at least 10 characters long" })
});

// Configure email transporter
const transporter = nodemailer.createTransport({
  host: CONFIG.email.host,
  port: CONFIG.email.port,
  secure: CONFIG.email.secure,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD,
  },
});

// Function to send notification email
async function sendEmailNotification(formData: z.infer<typeof inquirySchema>) {
  const mailOptions = {
    from: CONFIG.email.from,
    to: CONFIG.email.notificationEmail,
    subject: `New Enterprise Inquiry from ${formData.name} at ${formData.company}`,
    text: `
      Name: ${formData.name}
      Email: ${formData.email}
      Company: ${formData.company}
      Phone: ${formData.phone || 'Not provided'}
      Job Title: ${formData.jobTitle || 'Not provided'}
      Inquiry Type: ${formData.inquiryType || 'Not provided'}
      Message: ${formData.message}
    `,
    html: `
      <h2>New Enterprise Inquiry</h2>
      <p><strong>Name:</strong> ${formData.name}</p>
      <p><strong>Email:</strong> ${formData.email}</p>
      <p><strong>Company:</strong> ${formData.company}</p>
      <p><strong>Phone:</strong> ${formData.phone || 'Not provided'}</p>
      <p><strong>Job Title:</strong> ${formData.jobTitle || 'Not provided'}</p>
      <p><strong>Inquiry Type:</strong> ${formData.inquiryType || 'Not provided'}</p>
      <p><strong>Message:</strong> ${formData.message}</p>
    `,
  };

  return transporter.sendMail(mailOptions);
}

// // Function to save inquiry to database
// async function saveToDatabase(formData: z.infer<typeof inquirySchema>) {
//   return prisma.enterpriseInquiry.create({
//     data: {
//       name: formData.name,
//       email: formData.email,
//       company: formData.company,
//       message: formData.message,
//       createdAt: new Date(),
//     },
//   });
// }

// Optional: Function to send data to CRM
async function sendToCRM(formData: z.infer<typeof inquirySchema>) {
  // This is a placeholder for CRM integration
  // You would typically use a CRM-specific SDK or API here
  
  // Example with HubSpot:
  // const hubspot = new Hubspot({ apiKey: process.env.HUBSPOT_API_KEY });
  // return hubspot.contacts.create({
  //   properties: [
  //     { property: 'email', value: formData.email },
  //     { property: 'firstname', value: formData.name.split(' ')[0] },
  //     { property: 'lastname', value: formData.name.split(' ').slice(1).join(' ') },
  //     { property: 'company', value: formData.company },
  //     { property: 'message', value: formData.message }
  //   ]
  // });
  
  console.log('Sending to CRM:', formData);
  return Promise.resolve(); // Placeholder
}

// Add this function definition before you use it in your POST handler
async function sendConfirmationEmail(formData: z.infer<typeof inquirySchema>) {
  const mailOptions = {
    from:  `"Lookinit" <${CONFIG.email.from}>`,
    to: formData.email, // Send to the user's email address
    subject: `Thank you for your inquiry, ${formData.name}`,
    text: `
      Dear ${formData.name},

      Thank you for reaching out to Lookinit. We have received your inquiry and our team will get back to you shortly.

      Here's a summary of your message:
      
      Company: ${formData.company}
      Inquiry Type: ${formData.inquiryType || 'General'}
      Message: ${formData.message}

      If you have any additional questions, please don't hesitate to contact us.

      Best regards,
      The Lookinit Team
    `,
    html: `
      <h2>Thank you for reaching out to Lookinit</h2>
      <p>Dear ${formData.name},</p>
      <p>We have received your inquiry and our team will get back to you shortly.</p>
      
      <h3>Your message summary:</h3>
      <p><strong>Company:</strong> ${formData.company}</p>
      <p><strong>Inquiry Type:</strong> ${formData.inquiryType || 'General'}</p>
      <p><strong>Message:</strong> ${formData.message}</p>
      
      <p>If you have any additional questions, please don't hesitate to contact us.</p>
      
      <p>Best regards,<br>
      The Lookinit Team</p>
    `,
  };

  return transporter.sendMail(mailOptions);
}

export async function POST(request: Request) {
  try {
    // Get IP for rate limiting
    const ip = request.headers.get('x-forwarded-for') || 'anonymous';
    
    // Check rate limit
    const { success, limit, reset, remaining } = await ratelimit.limit(ip);
    
    // If rate limit exceeded, return 429 Too Many Requests
    if (!success) {
      return NextResponse.json(
        { 
          error: 'Rate limit exceeded',
          limit,
          remaining,
          reset: new Date(reset).toISOString()
        },
        { 
          status: 429,
          headers: {
            'X-RateLimit-Limit': limit.toString(),
            'X-RateLimit-Remaining': remaining.toString(),
            'X-RateLimit-Reset': reset.toString()
          }
        }
      );
    }
    
    // Parse the request body
    const formData = await request.json();
    console.log('Received form data:', formData);
    
    // Validate the form data using Zod
    const validationResult = inquirySchema.safeParse(formData);
    
    if (!validationResult.success) {
      console.error('Validation failed:', validationResult.error.format());
      return NextResponse.json(
        { 
          error: 'Validation failed',
          details: validationResult.error.format() 
        },
        { status: 400 }
      );
    }
    
    const validatedData = validationResult.data;
    
    // Process the inquiry (in parallel for efficiency)
    await Promise.all([
    //   saveToDatabase(validatedData),
      sendEmailNotification(validatedData),
      sendConfirmationEmail(validatedData),
      sendToCRM(validatedData)
    ]);
    
    // Return a success response
    return NextResponse.json(
      { 
        message: 'Inquiry received successfully',
        inquiry: {
          name: validatedData.name,
          email: validatedData.email,
          company: validatedData.company,
          // Don't return the full message for security/privacy
          messageSent: true
        }
      },
      { 
        status: 200,
        headers: {
          'X-RateLimit-Limit': limit.toString(),
          'X-RateLimit-Remaining': remaining.toString(),
        }
      }
    );
  } catch (error) {
    console.error('Error processing enterprise inquiry:', error);
    
    return NextResponse.json(
      { error: 'Failed to process inquiry' },
      { status: 500 }
    );
  }
}

// Optional: Add a GET handler to return an error for any GET requests
export async function GET() {
  return NextResponse.json(
    { error: 'Method not allowed' },
    { status: 405 }
  );
}
