const supabase = require('../config/supabaseClient');
const { v4: uuidv4 } = require('uuid');

/**
 * Uploads a file to Supabase Storage
 * @param {Object} file - The file object from multer
 * @returns {Promise<string>} - The public URL of the uploaded file
 */
const uploadToSupabase = async (file) => {
    try {
        if (!file) {
            throw new Error('No file provided');
        }

        const fileExt = file.originalname.split('.').pop();
        const fileName = `${uuidv4()}.${fileExt}`;
        const filePath = `${fileName}`;

        const { data, error } = await supabase.storage
            .from('images')
            .upload(filePath, file.buffer, {
                contentType: file.mimetype,
                upsert: false
            });

        if (error) {
            throw error;
        }

        const { data: publicUrlData } = supabase.storage
            .from('images')
            .getPublicUrl(filePath);

        return publicUrlData.publicUrl;
    } catch (error) {
        console.error('Error uploading to Supabase:', error);
        throw error;
    }
};

module.exports = uploadToSupabase;
