package com.gaooz.control;

import java.io.IOException;
import java.util.ArrayList;
import java.util.List;
import java.util.ListIterator;

import javax.websocket.CloseReason;
import javax.websocket.Endpoint;
import javax.websocket.EndpointConfig;
import javax.websocket.MessageHandler;
import javax.websocket.Session;


/**
 * 服务端
 * @author gaooz.com
 *
 */
public class Server extends Endpoint{
	//保存所有的连接
	private static List<Session> sessions;
	//站点的ID
	private static int[] site_id;
	//最大同步站点数
	private static List<String> site_color;
	private static final int MAX_SITE_NUM = 5;
	static{
		//所有客户端连接存放在此
		sessions = new ArrayList<Session>();
		//初始化站点ID
		site_id = new int[]{-1,-1,-1,-1,-1};
		//初始化站点色彩
		site_color = new ArrayList<String>();
		site_color.add("#EEC900");
		site_color.add("#EE3A8C");
		site_color.add("#B23AEE");
		site_color.add("#76EE00");
		site_color.add("#0000FF");
	}
	@Override
	public void onOpen(Session session, EndpointConfig config) {
		int i = 0;
		for(;i<MAX_SITE_NUM;i++){
			if(site_id[i]==-1){
				break;
			}
		}
		if(i==MAX_SITE_NUM){
			try {
				session.getBasicRemote().sendText("{\"type\":\"error\",\"content\":\"已达到最大客户端数目,不再接受新的连接！\"}");
			} catch (IOException e) {
				e.printStackTrace();
			}
			return;
		}
		//标记该站点id已经使用
		session.getUserProperties().put("site_id", i);
		System.out.println("your id: "+i);
		site_id[i] = 0;
		final int site_ID = i;
		sessions.add(session);
		session.addMessageHandler(new MessageHandler.Whole<String>() {
			@Override
			public void onMessage(String msg) {
				try {
					if(msg.equals("success")){
						session.getBasicRemote().sendText("{\"type\":\"msg\",\"content\":\"你的站点ID："+site_ID+"\"}");
					}
				} catch (Exception e) {
					e.printStackTrace();
				}
			}
		});
	}
	
	@Override
	public void onClose(Session session, CloseReason closeReason) {
		System.out.println(session.getUserProperties().get("site_id")+" closed!");
		//站点断开连接时释放一些信息
		try {
			//释放站点ID
			site_id[Integer.valueOf(session.getUserProperties().get("site_id").toString())] = -1;
			//广播给其他客户端
			String online_str = "[";
			for(Session s:sessions){
				if(s.getId()!=session.getId()){
					s.getBasicRemote().sendText("{\"type\":\"msg\",\"content\":\"Site "+session.getUserProperties().get("site_id")+" 退出了系统！\"}");
					int id = Integer.valueOf(s.getUserProperties().get("site_id").toString());
					online_str += "{\"site_id\":\""+id+"\",\"site_color\":\""+
					site_color.get(id)+"\"},";
				}
			}
			online_str = online_str.substring(0,online_str.length()-1);
			online_str += "]";
			String online = "{\"type\":\"online\",\"online_user\":"+online_str+"}";
			for(Session s :sessions){
				if(s.getId()!=session.getId()){
					s.getBasicRemote().sendText(online);
				}
			}
			//清理sessions中无效的连接
			for(ListIterator<Session> it = sessions.listIterator();it.hasNext();){
				Session s = it.next();
				if(session.getId()==s.getId()){
					it.remove();
				}
			}
			if(session.isOpen()){
				session.close();
			}
		} catch (IOException e) {
			e.printStackTrace();
		}
	}
}
