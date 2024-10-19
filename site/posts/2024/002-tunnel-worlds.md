---
title: "Tunnel Worlds"
subtitle: "Initial beta release"
date: 2024-10-18
---

Today marks the day that I'm releasing the initial beta version of Tunnel Worlds. This has been a long running project of mine, and I'm happy to finally be able to share it with the world.

### What is Tunnel Worlds?

Tunnel Worlds is a Minecraft mod that allows the user to easily play together in their single-player world with friends. Minecraft already supports something similar: Open to LAN. But this requires both of the players to be connected to the same network. Tunnel Worlds removes this restriction and allows you to play with anyone around the globe.

### Why did I make Tunnel Worlds?

Somewhere back in 2020 during the first lockdown, I wanted to play Minecraft with my friends. And no doubt many other people did too. But I didn't want to rent a server, or mess around with setting up a server on my own machine. So I started working on Tunnel Worlds, a mod that would allow non-technical people to easily play together.

I quickly managed to build a working prototype, but after that the motivation to continue working on it quickly faded. I still worked on it from time to time, but never brought it to a state where I was happy with it. 

But now, I finally found the motivation to push through and bring it to a releasable state. So here it is, the initial beta release of Tunnel Worlds.

### How does Tunnel Worlds work?

Tunnel Worlds partially relies on the already present Open to LAN feature in Minecraft. It starts this, and then creates a tunnel to this server. This server authenticates the players and forwards the packets to the actual Minecraft server. This tunnel is not just a TCP tunnel though, it initially parses the login packets to properly authenticate the players and be able to host many different servers on the same port. On top of that, it uses TLS between the hosting server and the tunnel server to ensure that the connection is secure and can't be intercepted.

### How can I get Tunnel Worlds?

You can download the mod from the [Tunnel Worlds website](https://tunnelworlds.com). The website also contains a guide on how to set it up and how to play with your friends.

### What's next for Tunnel Worlds?

Tunnel Worlds with be continuously developed, keeping updated with the latest Minecraft versions. Right now no new features are planned, but I'm open to suggestions. If you have any suggestions or issues, feel free to send them to the [Tunnel Worlds email address](mailto:contact@tunnelworlds.com). I'll try to respond to all emails, but I can't guarantee that I'll be able to implement all suggestions.
