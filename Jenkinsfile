
node { 
stage('Checkout SCM'){
git branch : 'master', url: 'https://github.com/popcornapps/apollo-web.git'
}
stage('Start Node'){
sh "npm start --host 0.0.0.0"
}
}
