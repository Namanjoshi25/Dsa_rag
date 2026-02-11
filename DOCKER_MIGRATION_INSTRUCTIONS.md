# Docker Storage Migration to E: Drive

## Quick Manual Method (Recommended)

Since your C: drive is full, follow these steps:

### Step 1: Stop Docker Desktop
1. Right-click Docker Desktop icon in system tray
2. Select "Quit Docker Desktop"
3. Wait for it to fully close

### Step 2: Move Docker Storage via Settings
1. Open Docker Desktop
2. Click the **Settings** (gear icon) in the top right
3. Go to **Resources** → **Advanced**
4. Find **"Disk image location"**
5. Click **"Change"** or **"Browse"**
6. Select or create folder: `E:\DockerData`
7. Click **"Apply & Restart"**

Docker will automatically move all data to the new location.

### Step 3: Clean Up Old Data (After Migration)
Once Docker is running from E: drive:
```powershell
# Clean up Docker resources
docker system prune -a --volumes -f

# Remove old Docker data from C: (after confirming it works)
# Only do this after verifying Docker works from E: drive!
```

## Alternative: Using PowerShell Script

If you prefer automation, run the provided script as Administrator:

```powershell
# Right-click PowerShell and "Run as Administrator"
cd E:\Coding\Projects\rag
.\move-docker-to-e.ps1
```

## Free Up C: Drive Space First (If Needed)

Before migrating, you might want to free some space:

1. **Empty Recycle Bin**
2. **Run Disk Cleanup**:
   - Press Win+R, type `cleanmgr`, press Enter
   - Select C: drive
   - Check all boxes and run cleanup
3. **Clear Windows Temp files**:
   ```powershell
   Remove-Item -Path "$env:TEMP\*" -Recurse -Force -ErrorAction SilentlyContinue
   ```
4. **Clear Docker (if accessible)**:
   ```powershell
   docker system prune -a --volumes -f
   ```

## Verify Migration

After moving Docker to E: drive:
```powershell
# Check Docker is working
docker ps

# Check disk space
Get-PSDrive C | Select FreeGB
Get-PSDrive E | Select FreeGB
```

## Troubleshooting

- **If Docker won't start**: Check that E: drive has at least 20GB free
- **If migration fails**: Try moving Docker data manually using robocopy
- **If WSL issues**: You may need to export/import WSL distributions


