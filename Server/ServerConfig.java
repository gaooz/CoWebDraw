package com.gaooz.control;

import java.util.HashSet;
import java.util.Set;

import javax.websocket.Endpoint;
import javax.websocket.server.ServerApplicationConfig;
import javax.websocket.server.ServerEndpointConfig;

public class ServerConfig implements ServerApplicationConfig{

	@Override
	public Set<Class<?>> getAnnotatedEndpointClasses(Set<Class<?>> arg0) {	
		return arg0;
	}

	@Override
	public Set<ServerEndpointConfig> getEndpointConfigs(Set<Class<? extends Endpoint>> arg0) {
		Set<ServerEndpointConfig> config = new HashSet<ServerEndpointConfig>();
		ServerEndpointConfig sc = 
				ServerEndpointConfig.Builder.create(Server.class, "/server").build();
		config.add(sc);
		return config;
	}
}
