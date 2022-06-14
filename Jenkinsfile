pipeline {
    agent any

    environment {
        NODE_ENV = 'test'
    }

    stages {
        stage('Test') {
            steps {
                echo "NODE_ENV environment variable set to ${env.NODE_ENV}"
                sh 'node -v'
            }

            // sh 'yarn'
            // sh 'yarn test'
        }

        // stage('Building Docker Image') {
        //     sh 'docker build .'
        // }
    }
}