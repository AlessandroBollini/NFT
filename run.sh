export NONCE=8
export ENVISIONING_DISABLED=0
export ACTUAL_DATE=$(date +'%Y-%m-%d')
#FOLLOWING LINE IS TO SET AN ARBITRARY DATE IN ORDER TO RELEASE SOME DAYS BEFORE
#export ACTUAL_DATE=$(date -d "5 days ago" +%Y-%m-%d)
node index.js