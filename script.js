const{ exec } = require('child_process')
const path = require('path')
const fs = require('fs')
const { S3Client, PutObjectCommand, S3Client } = require('@aws-sdk/client-s3')
const mime = require('mime-types')

const S3Client =  new S3Client({
    region: 'ap-south-1',
    credentials: {
        accessKeyId: 'AKIAQ3EGQTVCUXGLJAEE',
        secretAccessKey: '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'
    }
})

const PROJECT_ID= process.env.PROJECT_ID

async function init(){
    console.log('Executing script.js')
    const outDirPath = path.join(_dirname, 'out')

    const p = exec(`cd ${outDirPath} && npm install && npm run build`)
    p.stdout.on('data', function (data) {
        console.log(data.toString())
    })

    p.stdout.on('error', function (data){
        console.log(Error.toString())
    })

    p.on('close', async function() {
        console.log('Build Complete')
        const distFolderPath = path.join(_dirname, 'output', 'dist')
        const distFolderContent = fs.readdirSync(distFolderPath, { recursive: true})
        
        for (const filePath of distFolderContent) {
            if(fs.lstatSync(filePath).isDirectory()) continue;
            
            console.log('uploading', filePath)
             
            const command = new PutObjectCommand({
                Bucket: 'devx-vercel-clone',
                Key: `__output/${PROJECT_ID}/${filePath}`,
                Body: fs.createReadStream(filePath),
                ContentType: mime.lookup(filePath)
            })
            
            await S3Client.send(command)
            console.log('uploaded', filePath)
        }
        console.log('Done...')
    })
} 
init()