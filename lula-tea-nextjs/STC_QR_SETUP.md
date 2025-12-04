# STC Pay QR Code Setup Instructions

## Action Required: Add Your STC Pay QR Code

To complete the STC Pay payment integration, you need to add your personal QR code image to the project.

### Steps:

1. **Save your STC Pay QR code image** (the one you attached) as: `stc-qr-code.jpg`

2. **Place it in this folder**: 
   ```
   c:\Users\akbah\Dev\Sandbox-python\lula-tea-nextjs\public\images\
   ```

3. **File name must be exactly**: `stc-qr-code.jpg` (or `.png`)

### Current Status:
- ✅ Payment option UI added to checkout page
- ✅ Step-by-step instructions (bilingual) added
- ✅ Visual design with purple STC Pay branding
- ⏳ **Waiting for QR code image** at: `/public/images/stc-qr-code.jpg`

### After Adding the Image:

The checkout page will automatically display your QR code when customers select "STC Pay / Bank Transfer" as their payment method.

### What Customers Will See:

1. Three payment options:
   - Cash on Delivery
   - **STC Pay / Bank Transfer (QR Code)** ← NEW with "Instant" badge
   - WhatsApp Order

2. When they select STC Pay:
   - Your QR code displayed prominently
   - Total amount shown clearly
   - Expandable instructions on "How to scan QR code"
   - Step-by-step guide in both English and Arabic
   - Tips to help find the QR scanner in their banking app

3. After payment:
   - Customer fills delivery information
   - Order is confirmed with payment method marked as "stcpay"

### File Format:
- Supported: `.jpg`, `.jpeg`, `.png`
- Recommended size: 500x500px or larger
- The image will be displayed as square (aspect ratio maintained)

---

**Note**: If you want to use a different filename, update line in `/app/checkout/page.tsx`:
```typescript
src="/images/stc-qr-code.jpg"
```
