podTemplate {
    node(POD_LABEL) {
        stage('Run shell') {
            sh 'echo hello world'
        }
    }
}

// podTemplate(containers: [
//     containerTemplate(
//         name: 'node-agent', 
//         image: 'node:latest'
//     )
// ]) {
//     node(POD_LABEL) {
//         stage('Test project') {
//             container('node-agent') {
//                 stage('List all files') {
//                     sh ls
//                 }
//             }
//         }
//     }
// }

// pipeline {
//     agent {
//         docker { image 'node:16.13.1-alpine' }
//     }
    
//     stages {
//         stage('Test') {
//             steps {
//                 sh 'node --version'
//             }
//         }
//     }
// }

// pipeline {
//     agent any

//     environment {
//         NODE_ENV = 'test'
//     }

//     stages {
//         stage('Test') {
//             steps {
//                 echo "NODE_ENV environment variable set to ${env.NODE_ENV}"
//                 sh 'node -v'
//             }

//             // sh 'yarn'
//             // sh 'yarn test'
//         }

//         // stage('Building Docker Image') {
//         //     sh 'docker build .'
//         // }
//     }
// }
