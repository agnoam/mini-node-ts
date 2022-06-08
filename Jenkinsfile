podTemplate(containers: [
    containerTemplate(name: 'node', image: 'node', command: 'sleep', args: '99d')
]) {
    node(POD_LABEL) {
        container('node') {
            // Pull the code from the git
            git url: 'https://github.com/agnoam/mini-node-ts.git', branch: 'develop'
            sh 'yarn'
            
            stage('Tests') {
                sh 'yarn test'
            }

            stage('Build Docker image') {
                // Get the last image tag and increase it
            }

            stage('Publish to registry') {
                // Push to docker-registry
            }
        }
    }
}
