import numpy as np
import zipfile
import os
import sys
from PIL import Image
from Crypto.Cipher import AES
from Crypto.Util.Padding import unpad


def decrypt_file(file_path, key):
    # Read the encrypted file data
    with open(file_path, 'rb') as f:
        encrypted_data = f.read()

    # Extract the IV and encrypted data
    iv = encrypted_data[:16]
    encrypted_data = encrypted_data[16:]

    # Create AES cipher
    cipher = AES.new(key, AES.MODE_CBC, iv=iv)

    # Decrypt the data
    decrypted_data = unpad(cipher.decrypt(encrypted_data), AES.block_size)

    # Write the decrypted data back to a file
    with open(file_path, 'wb') as f:
        f.write(decrypted_data)


def extract_and_convert(zip_path, output_dir):
    # Create the output directory if it doesn't exist
    os.makedirs(output_dir, exist_ok=True)

    # Extract the zip file
    with zipfile.ZipFile(zip_path, 'r') as zipf:
        zipf.extractall(output_dir)

    # Load each numpy file and convert back to image
    for filename in os.listdir(output_dir):
        if filename.endswith('.npy'):
            file_path = os.path.join(output_dir, filename)
            data = np.load(file_path, allow_pickle=True).item()
            image_data = data['image']
            country = data['country']
            timestamp = data['timestamp']
            tag = data['tag']
            file_extension = data['file_extension']

            # Convert numpy array back to image
            image = Image.fromarray(image_data)

            # Save the image with the original extension
            image_filename = f"{os.path.splitext(filename)[0]}{file_extension}"
            image.save(os.path.join(output_dir, image_filename))

            print(f"Image saved as: {image_filename}")
            print("Country:", country)
            print("Timestamp:", timestamp)
            print("Tag:", tag)
            print("Image shape:", image_data.shape)


if __name__ == '__main__':
    if len(sys.argv) != 4:
        print("Usage: python script.py <encrypted_zip_path> <encryption_key> <output_dir>")
        sys.exit(1)

    encrypted_zip_path = sys.argv[1]
    encryption_key = sys.argv[2].encode()  # Ensure the key is in bytes
    output_dir = sys.argv[3]

    # Decrypt the zip file
    decrypt_file(encrypted_zip_path, encryption_key)
    print(f"File decrypted: {encrypted_zip_path}")

    # Extract and convert the decrypted zip file
    extract_and_convert(encrypted_zip_path, output_dir)
