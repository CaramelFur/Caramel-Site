---
title: "Tunnel Worlds"
subtitle: "Initial beta release"
date: 2024-10-18
---

Today marks the day that I'm releasing the initial beta version of **Tunnel Worlds**. This has been a long-running project of mine, and I'm happy to finally be able to share it with the world.

### What is Tunnel Worlds?

Tunnel Worlds is a Minecraft mod that allows users to easily play together in their single-player world with friends. Minecraft already supports something similar: Open to LAN. However, this requires both players to be connected to the same network. Tunnel Worlds removes this restriction and allows you to play with anyone around the globe.

### Why did I make Tunnel Worlds?

Back in 2020, during the first lockdown, I wanted to play Minecraft with my friends, and I’m sure many others felt the same. But I didn’t want to rent a server or mess around with setting one up on my own machine. So, I started working on Tunnel Worlds—a mod that would allow non-technical users to easily play together.

I quickly built a working prototype, but my motivation to continue working on it faded soon after. I still worked on it sporadically, but it never reached a state I was truly happy with. 

However, I finally found the drive to push through and bring it to a releasable state. So here it is, the initial beta release of **Tunnel Worlds**.

### How does Tunnel Worlds work?

Tunnel Worlds partially relies on Minecraft’s existing Open to LAN feature. It starts this feature and then creates a tunnel to the player’s server. This tunnel server authenticates players and forwards packets to the actual Minecraft server. The tunnel isn't just a simple TCP tunnel—it parses login packets to authenticate players and allows multiple servers to run on the same port. Additionally, it uses TLS between the hosting server and the tunnel server to ensure a secure connection that can't be intercepted.

### How can I get Tunnel Worlds?

You can download the mod from the [Tunnel Worlds website](https://tunnelworlds.com). The site also includes a guide on how to set it up and start playing with your friends.

### What's next for Tunnel Worlds?

Tunnel Worlds will be continuously developed to stay updated with the latest Minecraft versions. Currently, no new features are planned, but I'm open to suggestions. If you have any ideas or run into any issues, feel free to contact me at the [Tunnel Worlds email address](mailto:contact@tunnelworlds.com). I’ll do my best to respond to all emails, though I can’t guarantee I’ll be able to implement every suggestion.
