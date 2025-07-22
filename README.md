cd server
nodemon index.js


cd client
npm run dev


git pull origin main

git pull origin main --> always sets your folder to current position.without this it won't change synchronoulsy

copy folder structure

$src = "C:\Users\Abid\Desktop\MCQ_management_system"
$dst = "C:\Users\Abid\Desktop\Copied_Structure"

Get-ChildItem -Path $src -Recurse -Directory | ForEach-Object {
    $target = $_.FullName.Replace($src, $dst)
    New-Item -Path $target -ItemType Directory -Force
}
