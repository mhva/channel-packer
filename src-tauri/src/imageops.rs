use base64::write::EncoderStringWriter;
use image::io::Reader as ImageReader;
use image::{DynamicImage, ImageOutputFormat};
use serde::Serialize;
use std::io::{Cursor, Write};
use std::result::Result;

#[derive(Serialize, Debug, Clone)]
pub struct ImageMetadata {
    pub format: String,
    pub width: u32,
    pub height: u32,
    pub color_type: String,
    pub channel_count: u8,
    pub bpp: u16,
    pub has_alpha: bool,
    pub has_color: bool,
}

pub fn get_image_descriptor(path: &str) -> Result<(DynamicImage, ImageMetadata), anyhow::Error> {
    let reader = ImageReader::open(path)?.with_guessed_format()?;
    let maybe_format = reader.format();
    let img = reader.decode()?;
    let format = maybe_format.unwrap();
    let color_type = img.color();
    let metadata = ImageMetadata {
        format: format!("{format:?}").to_uppercase(),
        width: img.width(),
        height: img.height(),
        color_type: format!("{color_type:?}").to_uppercase(),
        channel_count: color_type.channel_count(),
        bpp: color_type.bits_per_pixel(),
        has_alpha: color_type.has_alpha(),
        has_color: color_type.has_color(),
    };

    Ok((img, metadata))
}

pub fn generate_thumbnail_as_data_url(image: &DynamicImage, w: u32, h: u32) -> String {
    let thumbnail = image.thumbnail(w, h);
    let mut cursor = Cursor::new(Vec::new());
    thumbnail
        .write_to(&mut cursor, ImageOutputFormat::Png)
        .unwrap();

    let mut buf = String::from("data:image/png;base64,");
    let mut writer = EncoderStringWriter::from(&mut buf, base64::STANDARD);
    writer.write_all(cursor.get_ref()).unwrap();
    writer.into_inner();
    buf
}
