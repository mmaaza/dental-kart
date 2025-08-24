#!/bin/bash
# Commands to run on your VPS to fix the upload directory issue

# If you're running the backend from /var/www/medical-bazzar/backend:
# Create the uploads directory in the correct location
mkdir -p /var/www/medical-bazzar/backend/public/uploads

# Move existing files (if any) from the absolute path to the relative path
if [ -d "/var/www/medical-bazzar/public/uploads" ]; then
    cp -r /var/www/medical-bazzar/public/uploads/* /var/www/medical-bazzar/backend/public/uploads/
    echo "Files copied from /var/www/medical-bazzar/public/uploads to /var/www/medical-bazzar/backend/public/uploads"
fi

# Set proper permissions
chmod -R 755 /var/www/medical-bazzar/backend/public/uploads
chown -R www-data:www-data /var/www/medical-bazzar/backend/public/uploads

echo "Upload directory setup complete!"
