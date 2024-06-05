# Save this script as generate-structure.ps1

param (
    [string]$rootPath = ".",
    [string[]]$exclude = @("node_modules", "build", "dist")
)

function Get-DirectoryTree {
    param (
        [string]$path,
        [string[]]$exclude,
        [int]$depth = 0
    )

    $indent = "  " * $depth
    $items = Get-ChildItem -Path $path

    foreach ($item in $items) {
        if ($exclude -notcontains $item.Name) {
            if ($item.PSIsContainer) {
                Write-Output "$indent$item\"
                Get-DirectoryTree -path $item.FullName -exclude $exclude -depth ($depth + 1)
            } else {
                Write-Output "$indent$item"
            }
        }
    }
}

$outputFile = "project-structure.txt"
Get-DirectoryTree -path $rootPath -exclude $exclude | Out-File $outputFile

Write-Output "Project structure has been written to $outputFile"
