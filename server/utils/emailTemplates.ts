/**
 * Email Templates for Billing Notifications
 * HTML email templates for various billing events
 */

export const emailTemplates = {
  /**
   * Usage Alert Email
   * Sent when company exceeds usage thresholds (50%, 75%, 90%, 100%+)
   */
  usageAlert: (data: {
    companyName: string;
    metric: string;
    percentage: number;
    current: number;
    limit: number;
    severity: 'info' | 'warning' | 'critical' | 'exceeded';
  }) => {
    const severityColors = {
      info: '#3b82f6',
      warning: '#f59e0b',
      critical: '#ef4444',
      exceeded: '#dc2626',
    };

    const severityLabels = {
      info: 'Usage Notice',
      warning: 'Usage Warning',
      critical: 'Critical Usage Alert',
      exceeded: 'Usage Limit Exceeded',
    };

    return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${severityLabels[data.severity]}</title>
</head>
<body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f3f4f6;">
  <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
    <div style="background-color: white; border-radius: 8px; padding: 30px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
      <div style="border-left: 4px solid ${severityColors[data.severity]}; padding-left: 20px; margin-bottom: 30px;">
        <h1 style="margin: 0; color: ${severityColors[data.severity]}; font-size: 24px;">
          ${severityLabels[data.severity]}
        </h1>
      </div>
      
      <p style="color: #374151; font-size: 16px; line-height: 1.5;">
        Hi ${data.companyName},
      </p>
      
      <p style="color: #374151; font-size: 16px; line-height: 1.5;">
        Your <strong>${data.metric}</strong> usage has reached <strong>${data.percentage}%</strong> of your plan limit.
      </p>
      
      <div style="background-color: #f9fafb; border-radius: 6px; padding: 20px; margin: 20px 0;">
        <div style="display: flex; justify-content: space-between; margin-bottom: 10px;">
          <span style="color: #6b7280;">Current Usage:</span>
          <strong style="color: #111827;">${data.current.toLocaleString()}</strong>
        </div>
        <div style="display: flex; justify-content: space-between; margin-bottom: 10px;">
          <span style="color: #6b7280;">Plan Limit:</span>
          <strong style="color: #111827;">${data.limit.toLocaleString()}</strong>
        </div>
        <div style="display: flex; justify-content: space-between;">
          <span style="color: #6b7280;">Usage Percentage:</span>
          <strong style="color: ${severityColors[data.severity]};">${data.percentage}%</strong>
        </div>
      </div>
      
      ${data.percentage >= 100 ? `
      <div style="background-color: #fef2f2; border-left: 4px solid #dc2626; padding: 15px; margin: 20px 0;">
        <p style="margin: 0; color: #991b1b; font-weight: 500;">
          ⚠️ You have exceeded your plan limit. Overage charges will apply.
        </p>
      </div>
      ` : ''}
      
      <p style="color: #374151; font-size: 16px; line-height: 1.5;">
        To avoid overage charges, consider upgrading your plan or reducing usage.
      </p>
      
      <div style="margin: 30px 0;">
        <a href="https://app.mervo.com.au/admin/billing" 
           style="display: inline-block; background-color: #3b82f6; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; font-weight: 500;">
          View Billing Dashboard
        </a>
      </div>
      
      <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 30px 0;">
      
      <p style="color: #6b7280; font-size: 14px; line-height: 1.5;">
        Need help? Contact us at <a href="mailto:support@mervo.com.au" style="color: #3b82f6;">support@mervo.com.au</a>
      </p>
    </div>
  </div>
</body>
</html>
    `.trim();
  },

  /**
   * Invoice Generated Email
   * Sent when a new monthly invoice is generated
   */
  invoiceGenerated: (data: {
    companyName: string;
    invoiceNumber: string;
    month: string;
    totalAmount: number;
    dueDate: string;
    invoiceUrl: string;
  }) => `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Invoice ${data.invoiceNumber}</title>
</head>
<body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f3f4f6;">
  <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
    <div style="background-color: white; border-radius: 8px; padding: 30px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
      <h1 style="margin: 0 0 20px 0; color: #111827; font-size: 24px;">
        Invoice ${data.invoiceNumber}
      </h1>
      
      <p style="color: #374151; font-size: 16px; line-height: 1.5;">
        Hi ${data.companyName},
      </p>
      
      <p style="color: #374151; font-size: 16px; line-height: 1.5;">
        Your invoice for <strong>${data.month}</strong> is now available.
      </p>
      
      <div style="background-color: #f9fafb; border-radius: 6px; padding: 20px; margin: 20px 0;">
        <div style="display: flex; justify-content: space-between; margin-bottom: 10px;">
          <span style="color: #6b7280;">Invoice Number:</span>
          <strong style="color: #111827;">${data.invoiceNumber}</strong>
        </div>
        <div style="display: flex; justify-content: space-between; margin-bottom: 10px;">
          <span style="color: #6b7280;">Billing Period:</span>
          <strong style="color: #111827;">${data.month}</strong>
        </div>
        <div style="display: flex; justify-content: space-between; margin-bottom: 10px;">
          <span style="color: #6b7280;">Due Date:</span>
          <strong style="color: #111827;">${new Date(data.dueDate).toLocaleDateString('en-AU')}</strong>
        </div>
        <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 15px 0;">
        <div style="display: flex; justify-content: space-between;">
          <span style="color: #6b7280; font-size: 18px;">Total Amount:</span>
          <strong style="color: #111827; font-size: 24px;">
            ${new Intl.NumberFormat('en-AU', { style: 'currency', currency: 'AUD' }).format(data.totalAmount)}
          </strong>
        </div>
      </div>
      
      <div style="margin: 30px 0;">
        <a href="${data.invoiceUrl}" 
           style="display: inline-block; background-color: #3b82f6; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; font-weight: 500; margin-right: 10px;">
          View Invoice
        </a>
        <a href="https://app.mervo.com.au/admin/billing" 
           style="display: inline-block; background-color: white; color: #3b82f6; padding: 12px 30px; text-decoration: none; border-radius: 6px; font-weight: 500; border: 1px solid #3b82f6;">
          Billing Dashboard
        </a>
      </div>
      
      <p style="color: #374151; font-size: 14px; line-height: 1.5; margin-top: 20px;">
        Payment will be automatically processed from your saved payment method.
      </p>
      
      <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 30px 0;">
      
      <p style="color: #6b7280; font-size: 14px; line-height: 1.5;">
        Questions about this invoice? Contact us at <a href="mailto:billing@mervo.com.au" style="color: #3b82f6;">billing@mervo.com.au</a>
      </p>
    </div>
  </div>
</body>
</html>
  `.trim(),

  /**
   * Payment Reminder Email
   * Sent for overdue invoices (3 days, 7 days)
   */
  paymentReminder: (data: {
    companyName: string;
    invoiceNumber: string;
    totalAmount: number;
    dueDate: string;
    daysOverdue: number;
  }) => `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Payment Reminder</title>
</head>
<body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f3f4f6;">
  <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
    <div style="background-color: white; border-radius: 8px; padding: 30px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
      <div style="border-left: 4px solid #ef4444; padding-left: 20px; margin-bottom: 30px;">
        <h1 style="margin: 0; color: #ef4444; font-size: 24px;">
          Payment Reminder
        </h1>
      </div>
      
      <p style="color: #374151; font-size: 16px; line-height: 1.5;">
        Hi ${data.companyName},
      </p>
      
      <p style="color: #374151; font-size: 16px; line-height: 1.5;">
        Invoice <strong>${data.invoiceNumber}</strong> is now <strong>${data.daysOverdue} days overdue</strong>.
      </p>
      
      <div style="background-color: #fef2f2; border-left: 4px solid #dc2626; padding: 15px; margin: 20px 0;">
        <p style="margin: 0; color: #991b1b; font-weight: 500;">
          ⚠️ Please make payment immediately to avoid service suspension.
        </p>
      </div>
      
      <div style="background-color: #f9fafb; border-radius: 6px; padding: 20px; margin: 20px 0;">
        <div style="display: flex; justify-content: space-between; margin-bottom: 10px;">
          <span style="color: #6b7280;">Invoice Number:</span>
          <strong style="color: #111827;">${data.invoiceNumber}</strong>
        </div>
        <div style="display: flex; justify-content: space-between; margin-bottom: 10px;">
          <span style="color: #6b7280;">Due Date:</span>
          <strong style="color: #dc2626;">${new Date(data.dueDate).toLocaleDateString('en-AU')}</strong>
        </div>
        <div style="display: flex; justify-content: space-between; margin-bottom: 10px;">
          <span style="color: #6b7280;">Days Overdue:</span>
          <strong style="color: #dc2626;">${data.daysOverdue} days</strong>
        </div>
        <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 15px 0;">
        <div style="display: flex; justify-content: space-between;">
          <span style="color: #6b7280; font-size: 18px;">Amount Due:</span>
          <strong style="color: #dc2626; font-size: 24px;">
            ${new Intl.NumberFormat('en-AU', { style: 'currency', currency: 'AUD' }).format(data.totalAmount)}
          </strong>
        </div>
      </div>
      
      <div style="margin: 30px 0;">
        <a href="https://app.mervo.com.au/admin/billing" 
           style="display: inline-block; background-color: #ef4444; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; font-weight: 500;">
          Make Payment Now
        </a>
      </div>
      
      <p style="color: #6b7280; font-size: 14px; line-height: 1.5;">
        If you're experiencing payment issues, please contact us immediately at <a href="mailto:billing@mervo.com.au" style="color: #3b82f6;">billing@mervo.com.au</a>
      </p>
    </div>
  </div>
</body>
</html>
  `.trim(),

  /**
   * Account Suspension Notice
   * Sent when account is suspended due to non-payment
   */
  accountSuspended: (data: {
    companyName: string;
    totalOverdue: number;
    invoiceCount: number;
  }) => `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Account Suspended</title>
</head>
<body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f3f4f6;">
  <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
    <div style="background-color: white; border-radius: 8px; padding: 30px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
      <div style="border-left: 4px solid #dc2626; padding-left: 20px; margin-bottom: 30px;">
        <h1 style="margin: 0; color: #dc2626; font-size: 24px;">
          Account Suspended
        </h1>
      </div>
      
      <p style="color: #374151; font-size: 16px; line-height: 1.5;">
        Hi ${data.companyName},
      </p>
      
      <p style="color: #374151; font-size: 16px; line-height: 1.5;">
        Your Mervo account has been suspended due to ${data.invoiceCount} overdue invoice${data.invoiceCount > 1 ? 's' : ''}.
      </p>
      
      <div style="background-color: #fef2f2; border: 2px solid #dc2626; border-radius: 6px; padding: 20px; margin: 20px 0;">
        <p style="margin: 0 0 15px 0; color: #991b1b; font-weight: 600; font-size: 18px;">
          🚫 Your account access is currently restricted
        </p>
        <p style="margin: 0; color: #991b1b;">
          Total outstanding balance: <strong style="font-size: 20px;">
            ${new Intl.NumberFormat('en-AU', { style: 'currency', currency: 'AUD' }).format(data.totalOverdue)}
          </strong>
        </p>
      </div>
      
      <p style="color: #374151; font-size: 16px; line-height: 1.5;">
        To restore access to your account:
      </p>
      
      <ol style="color: #374151; font-size: 16px; line-height: 1.8; padding-left: 20px;">
        <li>Make payment for all outstanding invoices</li>
        <li>Contact our billing team to confirm payment</li>
        <li>Your account will be reactivated within 1 business hour</li>
      </ol>
      
      <div style="margin: 30px 0;">
        <a href="https://app.mervo.com.au/admin/billing" 
           style="display: inline-block; background-color: #dc2626; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; font-weight: 500;">
          Pay Now
        </a>
      </div>
      
      <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 30px 0;">
      
      <p style="color: #6b7280; font-size: 14px; line-height: 1.5;">
        <strong>Need help?</strong><br>
        Email: <a href="mailto:billing@mervo.com.au" style="color: #3b82f6;">billing@mervo.com.au</a><br>
        Phone: 1300 MERVO AU (1300 637 862)
      </p>
    </div>
  </div>
</body>
</html>
  `.trim(),
};

/**
 * Email Service Integration Point
 * TODO: Integrate with actual email service (SendGrid, AWS SES, etc.)
 */
export async function sendEmail(to: string, subject: string, html: string) {
  // Placeholder - implement with your email service
  console.log('[Email] Sending email:', { to, subject });
  console.log('[Email] HTML preview:', html.substring(0, 200) + '...');
  
  // Example using SendGrid:
  // const sgMail = require('@sendgrid/mail');
  // sgMail.setApiKey(process.env.SENDGRID_API_KEY);
  // await sgMail.send({ to, from: 'billing@mervo.com.au', subject, html });
  
  return { success: true, messageId: 'preview-mode' };
}
