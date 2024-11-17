import os
import urllib.request

def download_image(url, save_path):
    try:
        urllib.request.urlretrieve(url, save_path)
        print(f"Downloaded: {save_path}")
    except Exception as e:
        print(f"Failed to download {url}: {e}")

def download_images_to_folder(numbers, folder_name):
    # Create the folder if it doesn't exist
    os.makedirs(folder_name, exist_ok=True)

    for number in numbers:
        image_url = f"https://geoportal.emtvalencia.es/ciudadano/icongenerator/create-line-image.php?size=30&type=normal&lineNumber={number}&showBorder=false&borderColor=white"
        image_path = os.path.join(folder_name, f"{number}.png")
        print(f"Downloading image for: {number}")
        download_image(image_url, image_path)

if __name__ == "__main__":
    numbers = [
        "C1", 4, 6, 7, 8, 9, 10, 11, 12, 13, 14, 16, 18, 19, 23, 24, 25, 26, 27, 28,
        30, 31, 32, 35, 40, 60, 62, 63, 64, 67, 70, 71, 72, 73, "C2", 81, "C3", "C3",
        92, 93, 94, 95, 98, 99, 77, "SE", "SE2"
    ]

    output_folder = "line_images"
    download_images_to_folder(numbers, output_folder)
    print(f"Images downloaded and saved to folder: {output_folder}")
