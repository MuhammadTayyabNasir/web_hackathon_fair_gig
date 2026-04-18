param(
    [string]$Model = $env:GROQ_MODEL,
    [string]$ApiKey = $env:GROQ_API_KEY
)

if ([string]::IsNullOrWhiteSpace($ApiKey)) {
    throw "GROQ_API_KEY is required. Set it before running this script."
}

if ([string]::IsNullOrWhiteSpace($Model)) {
    $Model = "meta-llama/llama-4-scout-17b-16e-instruct"
}

$body = @{
    model = $Model
    temperature = 0
    max_tokens = 40
    messages = @(
        @{ role = "system"; content = "Return plain text only." },
        @{ role = "user"; content = "Say exactly: API hit successful." }
    )
} | ConvertTo-Json -Depth 6

$headers = @{ Authorization = "Bearer $ApiKey" }

$response = Invoke-RestMethod -Method Post -Uri "https://api.groq.com/openai/v1/chat/completions" -Headers $headers -ContentType "application/json" -Body $body

Write-Host "MODEL: $($response.model)"
Write-Host "ID: $($response.id)"
Write-Host "OUTPUT: $($response.choices[0].message.content)"