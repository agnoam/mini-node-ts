pipeline {
    agent any

    stages {
        stage('Test') {
            steps {
                env.NODE_ENV = "test"
                echo "NODE_ENV environment variable set to ${env.NODE_ENV}"
            }

            // sh 'node -v'
            // sh 'yarn'
            // sh 'yarn test'
        }

        // stage('Building Docker Image') {
        //     sh 'docker build .'
        // }
    }
}