# Test script for user registration
$body = @{
    nome = "Teste Sistema"
    email = "teste.sistema@teste.com"
    senha = "teste123"
} | ConvertTo-Json

try {
    $response = Invoke-RestMethod -Uri "http://localhost:3001/api/auth/registrar" -Method POST -Body $body -ContentType "application/json"
    Write-Host "✅ Registration successful:"
    Write-Host $response
} catch {
    Write-Host "❌ Registration failed:"
    Write-Host $_.Exception.Message
    if ($_.Exception.Response) {
        $reader = New-Object System.IO.StreamReader($_.Exception.Response.GetResponseStream())
        $reader.BaseStream.Position = 0
        $reader.DiscardBufferedData()
        $responseBody = $reader.ReadToEnd()
        Write-Host "Response: $responseBody"
    }
}