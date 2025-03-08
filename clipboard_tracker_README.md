# Clipboard History Tracker

A Python application with a GUI that keeps track of your clipboard history, allowing you to view and reuse previously copied items.

## Features

- Automatically tracks clipboard changes
- Displays clipboard history with timestamps
- Copy items from history back to clipboard
- Delete individual items from history
- Clear entire clipboard history
- Dark theme with grey color palette

## Requirements

- Python 3.6 or higher
- pyperclip package

## Installation

1. Install the required package:
   ```
   pip install -r requirements.txt
   ```
   or
   ```
   pip install pyperclip
   ```

## Usage

1. Run the application:
   ```
   python clipboard_tracker.py
   ```

2. The application will automatically start tracking your clipboard.

3. Copy text as you normally would on your computer.

4. The application will display your clipboard history with timestamps.

5. To reuse an item from history:
   - Double-click on the item
   - Or select the item and click "Copy Selected"

6. To delete an item from history:
   - Select the item and click "Delete Selected"

7. To clear the entire history:
   - Click "Clear History"

## How It Works

The application uses a background thread to monitor your clipboard for changes. When new content is detected, it's added to the history list and displayed in the GUI. The history is limited to the most recent 50 items to prevent excessive memory usage.
