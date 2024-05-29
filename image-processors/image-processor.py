import os
import sys
import zipfile
from datetime import datetime

import numpy as np
from Crypto.Cipher import AES
from Crypto.Util.Padding import pad
from PIL import Image


def save_image_to_numpy(image_path, country, timestamp, tag, output_dir):
    # Load the image
    try:
        image = Image.open(image_path)
    except Exception as e:
        print(f"Error opening image {image_path}: {e}")
        return None

    # Convert image to numpy array
    image_data = np.array(image)

    # Get the file extension
    file_extension = os.path.splitext(image_path)[1]

    # Create a dictionary to hold the data
    data = {
        'image': image_data,
        'country': country,
        'timestamp': timestamp,
        'tag': tag,
        'file_extension': file_extension
    }

    # Create a filename for the numpy file
    filename = f"{country.replace(' ', '_')}_{os.path.basename(image_path).replace(' ', '_')}.npy"
    output_path = os.path.join(output_dir, filename)

    # Save the dictionary to a numpy file
    np.save(output_path, data)

    return output_path


def encrypt_file(file_path, key):
    # Read the file data
    with open(file_path, 'rb') as f:
        file_data = f.read()

    # Create AES cipher
    cipher = AES.new(key, AES.MODE_CBC)
    iv = cipher.iv

    # Encrypt the data
    encrypted_data = iv + cipher.encrypt(pad(file_data, AES.block_size))

    # Write the encrypted data back to a file
    with open(file_path, 'wb') as f:
        f.write(encrypted_data)


def main(image_paths, countries, tags, output_zip_path, encryption_key):
    if not (len(image_paths) == len(countries) == len(tags)):
        print("The number of images, countries, and tags must match.")
        return

    # Create an output directory for numpy files
    output_dir = "output_numpy_files"
    os.makedirs(output_dir, exist_ok=True)

    numpy_files = []
    for image_path, country, tag in zip(image_paths, countries, tags):
        # Get the current timestamp
        timestamp = datetime.now().isoformat()
        numpy_file = save_image_to_numpy(image_path, country, timestamp, tag, output_dir)
        if numpy_file:
            numpy_files.append(numpy_file)

    # Create a zip file to hold all numpy files
    with zipfile.ZipFile(output_zip_path, 'w') as zipf:
        for numpy_file in numpy_files:
            zipf.write(numpy_file, arcname=os.path.basename(numpy_file))

    # Encrypt the zip file
    encrypt_file(output_zip_path, encryption_key)

    print(f"Data saved and encrypted to {output_zip_path}")


if __name__ == '__main__':
    if len(sys.argv) < 6 or (len(sys.argv) - 3) % 3 != 0:
        print(
            "Usage: python script.py <output_zip_path> <encryption_key> <image_path_1> <country_1> <tag_1> "
            "<image_path_2> <country_2> <tag_2> ...")
        sys.exit(1)

    output_zip_path = sys.argv[1]
    encryption_key = sys.argv[2].encode()  # Ensure the key is in bytes
    image_paths = sys.argv[3::3]
    countries = sys.argv[4::3]
    tags = sys.argv[5::3]

    main(image_paths, countries, tags, output_zip_path, encryption_key)
