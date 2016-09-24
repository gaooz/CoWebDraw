package com.gaooz.control;

import java.io.IOException;
import java.util.ArrayList;
import java.util.List;
import java.util.Set;

import javax.websocket.CloseReason;
import javax.websocket.OnClose;
import javax.websocket.OnMessage;
import javax.websocket.OnOpen;
import javax.websocket.Session;
import javax.websocket.server.ServerEndpoint;
/**
 * 注解式服务端
 * @author gaooz.com
 * 2016/04/05
 *
 */
@ServerEndpoint("/CoWebDrawServer")
public class CoWebDrawServer {
	/**
	 * 服务端公共资源为所有连接使用
	 */
	//最大站点数目
	private static final int MAX_SITE_NUM = 5;
	//站点id集
	private static int sites[];
	//站点颜色集合
	private static List<String> colors;
	//初始化
	static{
		sites = new int[]{-1,-1,-1,-1,-1};
		colors = new ArrayList<String>();
		colors.add("#EEC900");
		colors.add("#EE3A8C");
		colors.add("#B23AEE");
		colors.add("#76EE00");
		colors.add("#0000FF");
	}
	@OnOpen
	public void open(Session session){
		int i = 0;
		for(;i<MAX_SITE_NUM;i++){
			if(sites[i]==-1){
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
		//设置站点的id
		session.getUserProperties().put("site_id", i);
		System.out.println("your id: "+i);
		sites[i] = 0;
		{
			//同步服务端的一些初始数据
			//只同步了站点id和颜色...2016.04.05
			String data = "{\"type\":\"synchronous\",\"site_id\":\""+i+"\",\"site_color\":\""
					+colors.get(i)+"\"}";
			System.out.println(data);
			try {
				session.getBasicRemote().sendText(data);
			} catch (IOException e) {
				e.printStackTrace();
			}
		}
		//更新在线信息
		try {
			String online = online_info(session,"open");
			session.getBasicRemote().sendText(online);
			for(Session s:session.getOpenSessions()){
				s.getBasicRemote().sendText(online);
				s.getBasicRemote().sendText("{\"type\":\"msg\",\"content\":\"SITE "
				+i+" JOIN!\",\"color\":\""+colors.get(i)+"\"}");
			}
		} catch (IOException e) {
			e.printStackTrace();
		}
	}
	
	@OnMessage
	public void message(Session session,String msg){
		System.out.println("receive client msg: "+msg);
		Set<Session> sessions = session.getOpenSessions();
		for(Session s:sessions){
			//转发给其他站点
			if(s.getId()!=session.getId()){
				try {
					s.getBasicRemote().sendText(msg);
				} catch (IOException e) {
					System.out.println("消息转发出错！于连接id："+s.getId());
					e.printStackTrace();
				}
			}
		}
		
	}
	
	@OnClose
	public void close(Session session, CloseReason closeReason){
		System.out.println(session.getUserProperties().get("site_id").toString()+" closed!");
		int id = Integer.valueOf(session.getUserProperties().get("site_id").toString());
		//回收可用的站点ID
		sites[id] = -1;
		Set<Session> sessions = session.getOpenSessions();
		//更新在线信息
		if(sessions!=null&&sessions.size()!=0){
			String online = online_info(session,"close");
			for(Session s:sessions){
				try {
					s.getBasicRemote().sendText("{\"type\":\"msg\",\"content\":\"SITE "
							+id+" QUIT!\",\"color\":\"red\"}");
					s.getBasicRemote().sendText(online);
				} catch (IOException e) {
					e.printStackTrace();
				}
			}
		}
	}
	/**
	 * @return 在线用户信息
	 */
	public String online_info(Session session,String flag){
		Set<Session> sessions = session.getOpenSessions();
		if(flag.equals("close")&&sessions.size()==0){
			return null;
		}
		//构造在线信息
		String online = "{\"type\":\"online\",\"online_user\":[";
		for(Session s:sessions){
			int id = Integer.valueOf(s.getUserProperties().get("site_id").toString());
			online += "{\"site_id\":\""+id+"\",\"site_color\":\""+colors.get(id)+"\"},";
		}
		if(flag.equals("open")){
			int id = Integer.valueOf(session.getUserProperties().get("site_id").toString());
			online += "{\"site_id\":\""+id+"\",\"site_color\":\""+colors.get(id)+"\"}]}";
		}else{
			online = online.substring(0,online.length()-1);
			online += "]}";
		}
		System.out.println("online:"+online);
		return online;
	}

}
