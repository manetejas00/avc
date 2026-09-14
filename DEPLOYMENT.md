# Deployment Guide

This document outlines the steps to deploy the application to Hostinger using SSH or Git Auto-Deploy.

## Hostinger SSH Details

- **IP Address:** `82.112.239.95`
- **Port:** `65002`
- **Username:** `u382139760`
- **SSH Command:** `ssh -p 65002 u382139760@82.112.239.95`

### Authorized SSH Key (Ngo)
```text
ssh-ed25519 AAAAC3NzaC1lZDI1NTE5AAAAIB5UYL/OQuOQuGrV/dpyAwEZOBDelpMUjXlGsHG0zaldT manetejas00
```
*(This key allows passwordless SSH access for the `manetejas00` machine if configured locally).*

---

## Method 1: Git Auto-Deploy (Current Setup)

You currently have Hostinger configured to pull from your GitHub repository (`manetejas00/avc`) directly into the `public_html` root directory.

### 1. Push changes to GitHub
Whenever you make changes, build the app locally and push everything (including the `dist` folder) to the `main` branch.
```bash
npm run build
git add src dist .env -f
git commit -m "Update website"
git push origin main
```

### 2. Fix the Hostinger Document Root
Because Hostinger Git clones the entire repository into `public_html`, the actual compiled website files are placed inside `public_html/dist`. You **must** configure Hostinger to serve this folder instead of the root folder.

1. Go to your Hostinger hPanel -> **Websites** -> **Manage**.
2. Find **Advanced** (or Domain Settings) and look for **Folder Index Manager** or **Document Root**.
3. Change the **Document Root** from `public_html` to **`public_html/dist`**.
4. Save the changes. Your website will now load the compiled Vite app correctly!

---

## Method 2: Manual Upload via SCP

If you prefer to bypass Git and upload the built files directly over SSH:

### 1. Build the Application locally
```bash
npm run build
```

### 2. Upload Files to Hostinger
Run the following command to securely copy the files. (If your SSH key is set up locally on this machine, it won't ask for a password).
```bash
scp -P 65002 -r dist/* u382139760@82.112.239.95:/home/u382139760/domains/test1.avinyacarefoundation.org/public_html/
```

---

## Method 3: Manual Upload via FTP

You can also use an FTP client (like FileZilla or SmartFTP) to upload your files.

### FTP Credentials
- **FTP IP (Hostname):** `82.112.239.95` (or `ftp://82.112.239.95`)
- **FTP Username:** `u382139760.test1.avinyacarefoundation.org`
- **FTP Port:** `21`
- **FTP Password:** `@qLVTyl.U8` *(based on your screenshot)*

> [!WARNING]
> Storing passwords in plain text in your code repository is a security risk. If your GitHub repository is public, anyone can see this password and access your server. Consider keeping this password locally or changing it if compromised.

### Steps
1. Open your FTP client and connect using the credentials above.
2. Run `npm run build` locally to generate the `dist` folder.
3. Open the `public_html` folder in your FTP client.
4. Upload all the contents **inside** your local `dist` folder directly into the `public_html` folder on your server.
