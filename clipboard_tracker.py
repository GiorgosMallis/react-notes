import tkinter as tk
from tkinter import ttk, messagebox, scrolledtext
import pyperclip
import threading
import time
import datetime
import re
import subprocess
import os
import sys

class ClipboardTracker:
    def __init__(self, root):
        self.root = root
        self.root.title("Clipboard History Tracker")
        self.root.geometry("800x600")
        self.root.configure(bg="#1a1a1a")  # Dark grey background
        
        # Set theme colors
        self.bg_color = "#1a1a1a"  # Dark grey background
        self.surface_color = "#2c2c2c"  # Medium-dark grey surface
        self.text_color = "#e0e0e0"  # Light grey text
        self.accent_color = "#4a4a4a"  # Accent color
        self.hover_color = "#3a3a3a"  # Hover color
        self.highlight_color = "#3a3a3a"  # Highlight color for score items
        
        # Configure styles
        self.configure_styles()
        
        # Clipboard history list
        self.clipboard_history = []
        self.score_history = []  # Special history for score items
        self.max_history = 50
        
        # Score patterns to match
        self.score_patterns = ["score_9", "score_8", "score_7"]
        
        # ComfyUI shortcut path
        self.comfyui_shortcut = os.path.join(os.path.expanduser("~"), "Desktop", "ComfyUI.lnk")
        self.comfyui_process = None
        self.comfyui_launch_time = 120  # 2 minutes in seconds
        
        # Status variables
        self.status_var = tk.StringVar()
        self.status_var.set("Ready")
        
        # Create GUI elements
        self.create_widgets()
        
        # Start monitoring clipboard
        self.previous_clipboard = ""
        self.monitoring = True
        self.monitor_thread = threading.Thread(target=self.monitor_clipboard)
        self.monitor_thread.daemon = True
        self.monitor_thread.start()
    
    def configure_styles(self):
        # Configure ttk styles
        style = ttk.Style()
        style.theme_use('default')
        
        # Configure Treeview
        style.configure("Treeview", 
                        background=self.surface_color, 
                        foreground=self.text_color, 
                        fieldbackground=self.surface_color)
        style.map('Treeview', background=[('selected', self.accent_color)])
        
        # Configure special Treeview for scores
        style.configure("Score.Treeview", 
                        background=self.surface_color, 
                        foreground="#ffcc00",  # Highlight color for score items
                        fieldbackground=self.surface_color)
        style.map('Score.Treeview', background=[('selected', self.accent_color)])
        
        # Configure Buttons
        style.configure("TButton", 
                        background=self.accent_color, 
                        foreground=self.text_color)
        style.map('TButton', 
                  background=[('active', self.hover_color)],
                  foreground=[('active', self.text_color)])
        
        # Configure Notebook
        style.configure("TNotebook", 
                        background=self.bg_color,
                        borderwidth=0)
        style.configure("TNotebook.Tab", 
                        background=self.surface_color,
                        foreground=self.text_color,
                        padding=[10, 2],
                        borderwidth=0)
        style.map("TNotebook.Tab",
                  background=[("selected", self.accent_color)],
                  foreground=[("selected", self.text_color)])
        
        # Configure Frame
        style.configure("TFrame", background=self.bg_color)
    
    def create_widgets(self):
        # Main frame
        main_frame = ttk.Frame(self.root)
        main_frame.pack(fill=tk.BOTH, expand=True, padx=10, pady=10)
        
        # Create notebook (tabbed interface)
        self.notebook = ttk.Notebook(main_frame)
        self.notebook.pack(fill=tk.BOTH, expand=True)
        
        # Create tab for general clipboard history
        self.history_tab = ttk.Frame(self.notebook)
        self.notebook.add(self.history_tab, text="All Clipboard History")
        
        # Create tab for score items
        self.score_tab = ttk.Frame(self.notebook)
        self.notebook.add(self.score_tab, text="Score Items")
        
        # Set up general history tab
        self.setup_history_tab()
        
        # Set up score history tab
        self.setup_score_tab()
        
        # Button frame
        button_frame = tk.Frame(self.root, bg=self.bg_color)
        button_frame.pack(fill=tk.X, padx=10, pady=10)
        
        # Buttons
        copy_button = ttk.Button(button_frame, text="Copy Selected", command=self.copy_selected)
        copy_button.pack(side=tk.LEFT, padx=5)
        
        delete_button = ttk.Button(button_frame, text="Delete Selected", command=self.delete_selected)
        delete_button.pack(side=tk.LEFT, padx=5)
        
        clear_button = ttk.Button(button_frame, text="Clear History", command=self.clear_history)
        clear_button.pack(side=tk.LEFT, padx=5)
        
        save_scores_button = ttk.Button(button_frame, text="Save Score Items", command=self.save_score_items)
        save_scores_button.pack(side=tk.LEFT, padx=5)
        
        launch_comfyui_button = ttk.Button(button_frame, text="Launch ComfyUI", command=self.launch_comfyui)
        launch_comfyui_button.pack(side=tk.LEFT, padx=5)
        
        # Status bar
        status_bar = tk.Frame(self.root, bg=self.surface_color)
        status_bar.pack(fill=tk.X, side=tk.BOTTOM)
        
        status_label = tk.Label(status_bar, 
                               textvariable=self.status_var,
                               bg=self.surface_color,
                               fg=self.text_color,
                               anchor="w",
                               padx=10,
                               pady=5)
        status_label.pack(fill=tk.X)
    
    def setup_history_tab(self):
        # Title label
        title_label = tk.Label(self.history_tab, 
                              text="Clipboard History", 
                              font=("Arial", 16, "bold"),
                              bg=self.bg_color,
                              fg=self.text_color)
        title_label.pack(pady=(0, 10))
        
        # Create treeview for clipboard history
        columns = ("timestamp", "content")
        self.tree = ttk.Treeview(self.history_tab, columns=columns, show="headings", height=15)
        
        # Define headings
        self.tree.heading("timestamp", text="Time")
        self.tree.heading("content", text="Content")
        
        # Define columns
        self.tree.column("timestamp", width=150, anchor="w")
        self.tree.column("content", width=600, anchor="w")
        
        # Add scrollbar
        scrollbar = ttk.Scrollbar(self.history_tab, orient=tk.VERTICAL, command=self.tree.yview)
        self.tree.configure(yscroll=scrollbar.set)
        
        # Pack treeview and scrollbar
        self.tree.pack(side=tk.LEFT, fill=tk.BOTH, expand=True)
        scrollbar.pack(side=tk.RIGHT, fill=tk.Y)
        
        # Double-click to copy
        self.tree.bind("<Double-1>", lambda event: self.copy_selected())
    
    def setup_score_tab(self):
        # Title label
        title_label = tk.Label(self.score_tab, 
                              text="Score Items (score_7, score_8, score_9)", 
                              font=("Arial", 16, "bold"),
                              bg=self.bg_color,
                              fg="#ffcc00")  # Gold color for emphasis
        title_label.pack(pady=(0, 10))
        
        # Create treeview for score history
        columns = ("timestamp", "content")
        self.score_tree = ttk.Treeview(self.score_tab, columns=columns, show="headings", height=15, style="Score.Treeview")
        
        # Define headings
        self.score_tree.heading("timestamp", text="Time")
        self.score_tree.heading("content", text="Content")
        
        # Define columns
        self.score_tree.column("timestamp", width=150, anchor="w")
        self.score_tree.column("content", width=600, anchor="w")
        
        # Add scrollbar
        scrollbar = ttk.Scrollbar(self.score_tab, orient=tk.VERTICAL, command=self.score_tree.yview)
        self.score_tree.configure(yscroll=scrollbar.set)
        
        # Pack treeview and scrollbar
        self.score_tree.pack(side=tk.LEFT, fill=tk.BOTH, expand=True)
        scrollbar.pack(side=tk.RIGHT, fill=tk.Y)
        
        # Double-click to copy
        self.score_tree.bind("<Double-1>", lambda event: self.copy_selected_score())
    
    def monitor_clipboard(self):
        while self.monitoring:
            try:
                current_clipboard = pyperclip.paste()
                if current_clipboard != self.previous_clipboard and current_clipboard.strip():
                    self.previous_clipboard = current_clipboard
                    self.add_to_history(current_clipboard)
                    
                    # Check if the clipboard content contains any of the score patterns
                    if any(pattern in current_clipboard for pattern in self.score_patterns):
                        self.add_to_score_history(current_clipboard)
                        # Launch ComfyUI when score pattern is detected
                        self.launch_comfyui()
            except Exception as e:
                print(f"Error monitoring clipboard: {e}")
            time.sleep(0.5)  # Check every half second
    
    def manual_check_clipboard(self):
        current_clipboard = pyperclip.paste()
        if current_clipboard.strip():  # Ignore empty clipboard
            self.add_to_history(current_clipboard)
            
            # Check if the clipboard content contains any of the score patterns
            if any(pattern in current_clipboard for pattern in self.score_patterns):
                self.add_to_score_history(current_clipboard)
                # Launch ComfyUI when score pattern is detected
                self.launch_comfyui()
    
    def add_to_history(self, content):
        # Get current timestamp
        timestamp = datetime.datetime.now().strftime("%Y-%m-%d %H:%M:%S")
        
        # Add to history list
        self.clipboard_history.insert(0, (timestamp, content))
        
        # Limit history size
        if len(self.clipboard_history) > self.max_history:
            self.clipboard_history.pop()
        
        # Update treeview
        self.update_treeview()
    
    def add_to_score_history(self, content):
        # Get current timestamp
        timestamp = datetime.datetime.now().strftime("%Y-%m-%d %H:%M:%S")
        
        # Add to score history list
        self.score_history.insert(0, (timestamp, content))
        
        # Update score treeview
        self.update_score_treeview()
        
        # Switch to score tab to alert user
        self.notebook.select(1)  # Select the score tab (index 1)
    
    def update_treeview(self):
        # Clear existing items
        for item in self.tree.get_children():
            self.tree.delete(item)
        
        # Add items from history
        for timestamp, content in self.clipboard_history:
            # Truncate content if too long
            display_content = content if len(content) < 50 else content[:47] + "..."
            self.tree.insert("", tk.END, values=(timestamp, display_content), tags=(content,))
    
    def update_score_treeview(self):
        # Clear existing items
        for item in self.score_tree.get_children():
            self.score_tree.delete(item)
        
        # Add items from score history
        for timestamp, content in self.score_history:
            # Truncate content if too long
            display_content = content if len(content) < 50 else content[:47] + "..."
            self.score_tree.insert("", tk.END, values=(timestamp, display_content), tags=(content,))
    
    def copy_selected(self):
        selected_item = self.tree.selection()
        if selected_item:
            item = self.tree.item(selected_item[0])
            content = item['values'][1]
            
            # If content was truncated, get original content from tags
            if content.endswith("..."):
                original_content = self.clipboard_history[self.tree.index(selected_item[0])][1]
                content = original_content
            
            pyperclip.copy(content)
            messagebox.showinfo("Copied", "Text copied to clipboard!")
    
    def copy_selected_score(self):
        selected_item = self.score_tree.selection()
        if selected_item:
            item = self.score_tree.item(selected_item[0])
            content = item['values'][1]
            
            # If content was truncated, get original content from tags
            if content.endswith("..."):
                original_content = self.score_history[self.score_tree.index(selected_item[0])][1]
                content = original_content
            
            pyperclip.copy(content)
            messagebox.showinfo("Copied", "Score item copied to clipboard!")
            
            # Launch ComfyUI when score item is copied
            self.launch_comfyui()
    
    def delete_selected(self):
        # Check which tab is active
        current_tab = self.notebook.index(self.notebook.select())
        
        if current_tab == 0:  # General history tab
            selected_item = self.tree.selection()
            if selected_item:
                index = self.tree.index(selected_item[0])
                self.clipboard_history.pop(index)
                self.update_treeview()
        else:  # Score history tab
            selected_item = self.score_tree.selection()
            if selected_item:
                index = self.score_tree.index(selected_item[0])
                self.score_history.pop(index)
                self.update_score_treeview()
    
    def clear_history(self):
        # Check which tab is active
        current_tab = self.notebook.index(self.notebook.select())
        
        if current_tab == 0:  # General history tab
            if messagebox.askyesno("Clear History", "Are you sure you want to clear the clipboard history?"):
                self.clipboard_history.clear()
                self.update_treeview()
        else:  # Score history tab
            if messagebox.askyesno("Clear Score History", "Are you sure you want to clear the score history?"):
                self.score_history.clear()
                self.update_score_treeview()
    
    def save_score_items(self):
        """Save score items to a text file"""
        if not self.score_history:
            messagebox.showinfo("No Data", "No score items to save!")
            return
            
        try:
            filename = f"score_items_{datetime.datetime.now().strftime('%Y%m%d_%H%M%S')}.txt"
            with open(filename, 'w', encoding='utf-8') as f:
                f.write("=== Score Items History ===\n\n")
                for timestamp, content in self.score_history:
                    f.write(f"[{timestamp}]\n{content}\n\n")
            
            messagebox.showinfo("Success", f"Score items saved to {filename}")
        except Exception as e:
            messagebox.showerror("Error", f"Failed to save score items: {e}")
    
    def launch_comfyui(self):
        """Launch ComfyUI and wait for it to load"""
        try:
            # Check if ComfyUI shortcut exists
            if not os.path.exists(self.comfyui_shortcut):
                self.status_var.set("ComfyUI shortcut not found on Desktop")
                messagebox.showerror("Error", "ComfyUI shortcut not found on Desktop")
                return
            
            # Update status
            self.status_var.set("Launching ComfyUI...")
            
            # Launch ComfyUI in a separate thread to avoid freezing the GUI
            launch_thread = threading.Thread(target=self._launch_comfyui_thread)
            launch_thread.daemon = True
            launch_thread.start()
            
        except Exception as e:
            self.status_var.set(f"Error launching ComfyUI: {e}")
            messagebox.showerror("Error", f"Failed to launch ComfyUI: {e}")
    
    def _launch_comfyui_thread(self):
        """Thread function to launch ComfyUI and wait"""
        try:
            # Launch ComfyUI
            if sys.platform == 'win32':
                self.comfyui_process = subprocess.Popen(f'start "" "{self.comfyui_shortcut}"', shell=True)
            else:
                self.comfyui_process = subprocess.Popen(['xdg-open', self.comfyui_shortcut])
            
            # Update status with countdown
            for remaining in range(self.comfyui_launch_time, 0, -1):
                if not self.monitoring:  # Check if application is closing
                    break
                self.status_var.set(f"ComfyUI loading... {remaining} seconds remaining")
                time.sleep(1)
            
            # Update status when done
            if self.monitoring:  # Only update if app is still running
                self.status_var.set("ComfyUI loaded and ready")
        
        except Exception as e:
            if self.monitoring:  # Only update if app is still running
                self.status_var.set(f"Error in ComfyUI launch thread: {e}")
    
    def on_closing(self):
        self.monitoring = False
        self.root.destroy()

if __name__ == "__main__":
    root = tk.Tk()
    app = ClipboardTracker(root)
    root.protocol("WM_DELETE_WINDOW", app.on_closing)
    root.mainloop()
