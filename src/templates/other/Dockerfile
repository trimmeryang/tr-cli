FROM hub.intra.mlamp.cn/miaozhen-frontend/nginx:alpine as production-stage

ARG DEPLOY_ENV="test"

# 添加 nginx 配置文件
COPY /deploy/nginx/default_${DEPLOY_ENV}.conf /etc/nginx/conf.d/default.conf
# 添加build 后的静态文件
ADD ./dist /usr/share/nginx/html

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]