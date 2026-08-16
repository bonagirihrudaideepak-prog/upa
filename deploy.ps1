param(
    [string]$FtpHost = $env:FTP_HOST,
    [string]$FtpUser = $env:FTP_USER,
    [string]$FtpPass = $env:FTP_PASS,
    [string]$RemoteDir = "public_html"
)

# NOTE: This script is a legacy FTP deploy helper. The production path is the
# GitHub Actions pipeline (see .github/workflows/deploy.yml + devops/).
# Credentials MUST come from environment variables (FTP_HOST/FTP_USER/FTP_PASS)
# or a gitignored credentials file — never hardcode them here.

if (-not $FtpHost -or -not $FtpUser -or -not $FtpPass) {
    # Try a gitignored credentials file: devops/ftp-credentials.json {"host":"...","user":"...","pass":"..."}
    $credFile = Join-Path $PSScriptRoot "devops/ftp-credentials.json"
    if (Test-Path $credFile) {
        $cfg = Get-Content $credFile -Raw | ConvertFrom-Json
        $FtpHost = if (-not $FtpHost) { $cfg.host } else { $FtpHost }
        $FtpUser = if (-not $FtpUser) { $cfg.user } else { $FtpUser }
        $FtpPass = if (-not $FtpPass) { $cfg.pass } else { $FtpPass }
    }
}

if (-not $FtpHost -or -not $FtpUser -or -not $FtpPass) {
    Write-Error "Missing FTP credentials. Set FTP_HOST, FTP_USER, FTP_PASS env vars (or devops/ftp-credentials.json)."
    exit 1
}

$localRoot = $PSScriptRoot
$excludeDirs = @("node_modules", ".git", "frontend", "devops")
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

Write-Host "=== Deploying Upanishad Store (legacy FTP helper) ==="
Write-Host "Host: $FtpHost  Target: /$RemoteDir/"

Ensure-Directory $RemoteDir
Upload-Directory $localRoot ""

Write-Host ""
Write-Host "=== Deployment Summary ==="
Write-Host "Files uploaded: $fileCount"
Write-Host "Errors: $errorCount"
if ($errorCount -eq 0) {
    Write-Host "SUCCESS: Store deployed!" -ForegroundColor Green
} else {
    Write-Host "Some files failed. Check errors above and re-run." -ForegroundColor Yellow
}