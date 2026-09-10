$body = @{
    title = "BBCA Naik 5% Hari Ini"
    content = "Harga saham BBCA naik 5% hari ini setelah bank sentral menurunkan suku bunga. Analis memperkirakan tren positif akan berlanjut."
} | ConvertTo-Json

# N8N_API_KEY dari Vercel Environment Variables
$n8nApiKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJmMzAyMDViMi1hMzY1LTQyZDUtODE0ZS0yYzRiYjJkNDQyYmIiLCJpc3MiOiJuOG4iLCJhdWQiOiJwdWJsaWMtYXBpIiwianRpIjoiNDdmMGMwYjktMTQ1MC00NjcwLTk3ZjktZjA1ZDU2Y2EzM2ViIiwiaWF0IjoxNzg4OTM1MDA2fQ.PVtFSytgbdeoVO_86oOpYZPMmNbYOYEV9MCaUSVVGos"

Write-Host "--- Testing /api/classify (POST, no API key needed) ---"
try {
    $response = Invoke-RestMethod -Uri 'https://saham-fyp.vercel.app/api/classify' -Method POST -ContentType 'application/json' -Body $body
    $response | ConvertTo-Json -Depth 5
} catch {
    Write-Host "Error: $($_.Exception.Message)"
    $streamReader = [System.IO.StreamReader]::new($_.Exception.Response.GetResponseStream())
    $errBody = $streamReader.ReadToEnd()
    Write-Host "Body: $errBody"
}

Write-Host "`n--- Testing /api/enrich (POST, with correct API key) ---"
try {
    $body_enrich = @{
        title = "BBCA Naik 5%"
        content = "Harga saham BBCA naik 5% hari ini"
        category = "SINGLE_STOCK"
        ticker = "BBCA"
    } | ConvertTo-Json
    $response = Invoke-RestMethod -Uri 'https://saham-fyp.vercel.app/api/enrich' -Method POST -ContentType 'application/json' -Body $body_enrich -Headers @{'X-API-Key'=$n8nApiKey}
    $response | ConvertTo-Json -Depth 5
} catch {
    Write-Host "Error: $($_.Exception.Message)"
    $streamReader = [System.IO.StreamReader]::new($_.Exception.Response.GetResponseStream())
    $errBody = $streamReader.ReadToEnd()
    Write-Host "Body: $errBody"
}

Write-Host "`n--- Testing /api/generate (POST, with correct API key) ---"
try {
    $body_generate = @{
        title = "BBCA Naik 5%"
        content = "Harga saham BBCA naik 5% hari ini"
        category = "SINGLE_STOCK"
        ticker = "BBCA"
    } | ConvertTo-Json
    $response = Invoke-RestMethod -Uri 'https://saham-fyp.vercel.app/api/generate' -Method POST -ContentType 'application/json' -Body $body_generate -Headers @{'X-API-Key'=$n8nApiKey}
    $response | ConvertTo-Json -Depth 5
} catch {
    Write-Host "Error: $($_.Exception.Message)"
    $streamReader = [System.IO.StreamReader]::new($_.Exception.Response.GetResponseStream())
    $errBody = $streamReader.ReadToEnd()
    Write-Host "Body: $errBody"
}

Write-Host "`n--- Testing /api/posts (GET, with correct API key) ---"
try {
    $response = Invoke-RestMethod -Uri 'https://saham-fyp.vercel.app/api/posts' -Method GET -Headers @{'X-API-Key'=$n8nApiKey}
    $response | ConvertTo-Json -Depth 5
} catch {
    Write-Host "Error: $($_.Exception.Message)"
    $streamReader = [System.IO.StreamReader]::new($_.Exception.Response.GetResponseStream())
    $errBody = $streamReader.ReadToEnd()
    Write-Host "Body: $errBody"
}

Write-Host "`n--- Testing /api/publish (POST, with correct API key) ---"
try {
    $body_publish = @{
        postId = "test-123"
        cloudinaryUrls = @("https://res.cloudinary.com/test/image/upload/sample.jpg")
        caption = "Test caption"
    } | ConvertTo-Json
    $response = Invoke-RestMethod -Uri 'https://saham-fyp.vercel.app/api/publish' -Method POST -ContentType 'application/json' -Body $body_publish -Headers @{'X-API-Key'=$n8nApiKey}
    $response | ConvertTo-Json -Depth 5
} catch {
    Write-Host "Error: $($_.Exception.Message)"
    $streamReader = [System.IO.StreamReader]::new($_.Exception.Response.GetResponseStream())
    $errBody = $streamReader.ReadToEnd()
    Write-Host "Body: $errBody"
}

