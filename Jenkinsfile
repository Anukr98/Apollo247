pipeline {
    agent any
    stages {
        stage('Checkout SCM'){
            steps {
                git branch: 'development',
                credentialsId: 'githuborg',
                url: 'https://github.com/popcornapps/apollo-hospitals.git'    
            }
            
        }
        stage('Shutdown Docker Images') {
            steps{
                sh "/usr/local/bin/docker-compose -f docker-compose.yml down"    
            }
        }
        stage('Install Web Modules') {
            steps {
                sh "/usr/local/bin/docker-compose -f docker-compose.yml run --rm web npm install --production=false"
    
            }
        }
        stage("lint checking on Web Service") {
            steps {
                sh "/usr/local/bin/docker-compose -f docker-compose.yml run --rm web npm run lint"
            }
            
        }
        
         stage("Syntax Check") {
            steps {
                sh "/usr/local/bin/docker-compose -f docker-compose.yml run --rm web npm run format:check"
            }
            
        }
    }
    post { 
        always { 
            echo 'I will always say Hello again!'
        }
    }
}
