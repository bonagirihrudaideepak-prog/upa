param(
    [string]$FtpHost = "ftpupload.net",
    [string]$FtpUser = "if0_42539987",
    [string]$FtpPass = "x3afQcwaOu3X3",
    [string]$RemoteDir = "htdocs"
)

$localRoot = $PSScriptRoot
$excludeDirs = @("node_modules", ".git")
$fileCount = 0
$errorCount = 0

function Upload-File($localPath, $remotePath) {
    try {
        $uri = "ftp://$FtpHost/$remotePath"
        $request = [System.Net.FtpWebRequest]::Create($uri)
        $request.Method = [System.Net.WebRequestMethods+Ftp]::UploadFile
        $request.Credentials = New-Object System.Net.NetworkCredential($FtpUser, $FtpPass)
        $request.UsePassive = $true
        $request.UseBinary = $true
        $request.Timeout = 60000

        $fileBytes = [System.IO.File]::ReadAllBytes($localPath)
        $request.ContentLength = $fileBytes.Length

        $stream = $request.GetRequestStream()
        $stream.Write($fileBytes, 0, $fileBytes.Length)
        $stream.Close()

        $response = $request.GetResponse()
        $response.Close()
        return $true
    } catch {
        Write-Warning "Failed: $remotePath - $_"
        return $false
    }
}

function Ensure-Directory($remotePath) {
    try {
        $uri = "ftp://$FtpHost/$remotePath"
        $request = [System.Net.FtpWebRequest]::Create($uri)
        $request.Method = [System.Net.WebRequestMethods+Ftp]::MakeDirectory
        $request.Credentials = New-Object System.Net.NetworkCredential($FtpUser, $FtpPass)
        $request.UsePassive = $true
        $request.Timeout = 15000
        $response = $request.GetResponse()
        $response.Close()
    } catch {
        # Directory likely exists - ignore
    }
}

function Upload-Directory($localDir, $remoteSubDir) {
    $remotePath = if ($remoteSubDir) { "$RemoteDir/$remoteSubDir" } else { $RemoteDir }

    Get-ChildItem -Path $localDir -Force | ForEach-Object {
        $localItem = $_.FullName
        $relativePath = if ($remoteSubDir) { "$remoteSubDir/$($_.Name)" } else { $_.Name }

        if ($_.PSIsContainer) {
            if ($_.Name -in $excludeDirs) { return }
            $subRemotePath = if ($remoteSubDir) { "$RemoteDir/$remoteSubDir/$($_.Name)" } else { "$RemoteDir/$($_.Name)" }
            Ensure-Directory $subRemotePath
            Upload-Directory $localItem $relativePath
        } else {
            $remoteFilePath = "$RemoteDir/$relativePath" -replace '\\', '/'
            Write-Host "Uploading: $relativePath"
            if (Upload-File $localItem $remoteFilePath) {
                $script:fileCount++
            } else {
                $script:errorCount++
            }
        }
    }
}

Write-Host "=== Deploying Upanishad Store to InfinityFree ==="
Write-Host "Host: $FtpHost  Target: /$RemoteDir/"
Write-Host ""

# Ensure remote htdocs directory exists
Ensure-Directory $RemoteDir

# Upload everything
Upload-Directory $localRoot ""

Write-Host ""
Write-Host "=== Deployment Summary ==="
Write-Host "Files uploaded: $fileCount"
Write-Host "Errors: $errorCount"
if ($errorCount -eq 0) {
    Write-Host "SUCCESS: Store deployed to InfinityFree!" -ForegroundColor Green
    Write-Host "Visit: https://upanishad-store.infinityfreeapp.com/" -ForegroundColor Cyan
} else {
    Write-Host "Some files failed. Check errors above and re-run." -ForegroundColor Yellow
}
