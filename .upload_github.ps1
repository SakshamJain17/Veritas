$ErrorActionPreference = 'Stop'
$gh = 'C:\Program Files\GitHub CLI\gh.exe'
$repo = 'Pushkar-1202/veritas_2.0'
$rootPath = (Get-Location).Path.TrimEnd('\\') + '\\'
$bootstrap = [Convert]::ToBase64String([System.Text.Encoding]::UTF8.GetBytes('# Initial upload'))
$bootstrapJson = @{ message = 'Initialize repository'; content = $bootstrap } | ConvertTo-Json -Compress
$null = $bootstrapJson | & $gh api --method PUT "repos/$repo/contents/README.md" --input -
if ($LASTEXITCODE -ne 0) { throw 'Failed to initialize empty repository' }
$refJson = & $gh api "repos/$repo/git/ref/heads/main"
if ($LASTEXITCODE -ne 0) { throw 'Failed to read main branch after initialization' }
$ref = $refJson | ConvertFrom-Json
$parentSha = $ref.object.sha
$parentJson = & $gh api "repos/$repo/git/commits/$parentSha"
if ($LASTEXITCODE -ne 0) { throw 'Failed to read initial commit' }
$parent = $parentJson | ConvertFrom-Json
$files = Get-ChildItem -LiteralPath (Get-Location) -Recurse -File -Force | Where-Object { $_.FullName -notmatch '[\\/]\.git[\\/]' -and $_.Name -ne '.upload_github.ps1' }
$entries = [System.Collections.Generic.List[object]]::new()
foreach ($file in $files) {
    $relative = $file.FullName.Substring($rootPath.Length).Replace('\', '/')
    $bytes = [System.IO.File]::ReadAllBytes($file.FullName)
    $content = [Convert]::ToBase64String($bytes)
    $blobBody = @{ content = $content; encoding = 'base64' } | ConvertTo-Json -Compress
    $blobJson = $blobBody | & $gh api --method POST "repos/$repo/git/blobs" --input -
    if ($LASTEXITCODE -ne 0) { throw "Failed to create blob for $relative" }
    $blob = $blobJson | ConvertFrom-Json
    $entries.Add(@{ path = $relative; mode = '100644'; type = 'blob'; sha = $blob.sha })
}
$treeBody = @{ base_tree = $parent.tree.sha; tree = @($entries) } | ConvertTo-Json -Depth 10 -Compress
$treeJson = $treeBody | & $gh api --method POST "repos/$repo/git/trees" --input -
if ($LASTEXITCODE -ne 0) { throw 'Failed to create Git tree' }
$tree = $treeJson | ConvertFrom-Json
$commitBody = @{ message = 'Upload project files'; tree = $tree.sha; parents = @($parentSha) } | ConvertTo-Json -Compress
$commitJson = $commitBody | & $gh api --method POST "repos/$repo/git/commits" --input -
if ($LASTEXITCODE -ne 0) { throw 'Failed to create commit' }
$commit = $commitJson | ConvertFrom-Json
$refBody = @{ sha = $commit.sha; force = $true } | ConvertTo-Json -Compress
$refJson = $refBody | & $gh api --method PATCH "repos/$repo/git/refs/heads/main" --input -
if ($LASTEXITCODE -ne 0) { throw 'Failed to update main branch' }
$repoBody = @{ default_branch = 'main' } | ConvertTo-Json -Compress
$updated = $repoBody | & $gh api --method PATCH "repos/$repo" --input -
if ($LASTEXITCODE -ne 0) { throw 'Failed to set main as the default branch' }
Write-Output "Uploaded $($files.Count) files in commit $($commit.sha)"
