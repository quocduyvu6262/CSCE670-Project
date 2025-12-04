# Project Setup Guide

Follow these steps to set up the backend, build the extension, and install it in Google Chrome.

## 1. Install Python Dependencies
From the root directory of the project, run the following command to install the required Python packages:

```bash
pip install -r requirements.txt
```

## 2. Build the Extension
Navigate to the `fack_checker` folder to install Node dependencies and build the frontend:

```bash
cd fack_checker
npm install
npm run build
```

## 3. Download Embedding
Go to [this Google Drive folder](https://drive.google.com/drive/folders/1-E4J03a8Br7slcV9QwmCryL1TV3AeXGA?usp=sharing) and download the three files. Then, at the root folder, place them in `embeddings/faiss_index/`.


## 4. Run the Backend Server
Return to the root directory and start the API server:

```bash
cd ..
python app/api.py
```

## 5. Install in Google Chrome
1. Open Google Chrome and navigate to `chrome://extensions/`.
2. Toggle **Developer mode** on (usually located in the top right corner).
3. Click the **Load unpacked** button.
4. Select the `dist` folder located inside the `fack_checker` directory.

## Usage
Once the extension is installed and the backend server is running:

1. Highlight any word or text on a webpage.
2. Use the keyboard shortcut to trigger the extension:
   * **Mac:** `Cmd` + `Shift` + `E`
   * **Windows:** `Ctrl` + `Shift` + `E`