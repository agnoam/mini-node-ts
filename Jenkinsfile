node('node') {
    currentBuild.result = "SUCCESS"

    try {
        stage('Checkout') {
            checkout scm
        }

        stage('Test') {
            env.NODE_ENV = "test"
            print "NODE_ENV environment variable set to ${env.NODE_ENV}"

            sh 'node -v'
            sh 'yarn'
            sh 'yarn test'
        }

        stage('Building Docker Image') {
            sh 'docker build .'
        }
    }
}