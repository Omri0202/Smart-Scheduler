from PIL import Image, ImageDraw, ImageFont
import os

def create_icon(size, bg_color, text_color, output_path):
    # Create a new image with the specified size and background color
    img = Image.new('RGBA', (size, size), bg_color)
    draw = ImageDraw.Draw(img)
    
    # Add text to the icon
    try:
        # Try to use a nice font if available
        font = ImageFont.truetype("arial.ttf", size//4)
    except IOError:
        # Fall back to default font
        font = ImageFont.load_default()
    
    # Draw the text in the center of the image
    text = "SC"  # Short for Smart Calendar
    bbox = draw.textbbox((0, 0), text, font=font)
    text_width = bbox[2] - bbox[0]
    text_height = bbox[3] - bbox[1]
    x = (size - text_width) // 2
    y = (size - text_height) // 2
    
    draw.text((x, y), text, font=font, fill=text_color)
    
    # Save the image
    img.save(output_path, 'PNG')
    print(f"Created icon at {output_path}")

# Create 192x192 icon
create_icon(192, (99, 102, 241, 255), (255, 255, 255, 255), "icon-192x192.png")

# Create 512x512 icon
create_icon(512, (99, 102, 241, 255), (255, 255, 255, 255), "icon-512x512.png")
