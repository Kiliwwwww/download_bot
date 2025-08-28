apt update
apt install lsof -y
apt install tzdata -y
ln -snf /usr/share/zoneinfo/Asia/Shanghai /etc/localtime
echo "Asia/Shanghai" > /etc/timezone

pip install -r requirements.txt

