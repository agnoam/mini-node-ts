/* 
    This Jenkinsfile will take the code of this project, and will run a unit testing on it. 
    After that, it will try to build a docker image out of it. And publish it to a registry

    Please ensure this plugins installed and setup on your Jenkins master:
        * Kuberentes
        * Config File Provider
*/

podTemplate(containers: [
    containerTemplate(name: 'node', image: 'node', command: 'sleep', args: '99d'),
    containerTemplate(name: 'docker', image: 'docker:dind-rootless', command: 'sleep', args: '99d')
]) {
    // environment {
    //     // Using configfile plugin to read external config file
    //     configFileProvider([configFile(fileId: 'build-data', variable: 'GIT_REPO')]) {
    //         ENV_GIT_REPO = $GIT_REPO
    //         ENV_REGISTRY_URL = 
    //     }
    // }

    // Take random node from cluster, and deploy the given containers to a pod
    node(POD_LABEL) {
        container('node') {
            // Pull the code from the git
            git url: $ENV_GIT_REPO, branch: $BRANCH_NAME
            sh 'yarn'
            
            // stage('Quality code test') {}

            stage('Unit test') {
                sh 'yarn test'
            }
        }

        // container('docker') {
        //     // Pull the code from the git
        //     git url: $ENV_GIT_REPO, branch: $BRANCH_NAME
        //     IMAGE_NAME = '$ENV_REGISTRY_URL/$IMAGE_NAME:$IMAGE_TAG'
            
        //     // Get the last image tag and increase it
        //     stage('Build Docker image') {
        //         sh 'docker build . -t $IMAGE_NAME'
        //     }

        //     stage('Publish to registry') {
        //         // Push to docker-registry
        //         sh 'docker push $IMAGE_NAME'
        //     }
        // }

        // Continus deployment in k8s
        // stage('Deploy to kubernetes') {}
    }
}
