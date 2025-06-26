function Print-Tree {
    param (
        [string]$Path,
        [int]$Depth = 3,
        [int]$Level = 0
    )

    if ($Level -ge $Depth) { return }

    Get-ChildItem $Path | Sort-Object PSIsContainer, Name | ForEach-Object {
        $prefix = ('  ' * $Level) + '+-- '
        "$prefix$($_.Name)" | Out-File -Append structure_ascii.md
        if ($_.PSIsContainer) {
            Print-Tree -Path $_.FullName -Depth $Depth -Level ($Level + 1)
        }
    }
}

# Supprimer le fichier s’il existe déjà
Remove-Item -ErrorAction SilentlyContinue structure_ascii.md

# Lancer la génération
Print-Tree -Path "./src" -Depth 3

Write-Host "✅ Arborescence générée dans structure_ascii.md"
