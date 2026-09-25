package com.ecommerce.authservice.entity;
import java.time.LocalDateTime;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
@Entity
public class Users {
	@Id
	@GeneratedValue(strategy=GenerationType.IDENTITY)
	private int id;
	private String username;
	private String email;
	private String phone;
	private String password;
	private String role;
	private LocalDateTime createdAt;
	private String address;
	public Users()
	{
		
	}
	public Users(int id,String username,String email,String phone,
			String password,String role,LocalDateTime createdAt,String address)
	{
		this.id=id;
		this.username=username;
		this.email=email;
		this.phone=phone;
		this.password=password;
		this.role=role;
		this.createdAt=createdAt;
		this.address = address;
	}
	public void setId(int id)
	{
		this.id=id;
	}
	public void setUsername(String username)	
	{
		this.username=username;
	}
	public void setEmail(String email)
	{
		this.email=email;
	}
	public void setPhone(String phone)
	{
		this.phone=phone;
	}
	public void setPassword(String password)
	{
		this.password=password;
	}
	public void setRole(String role)
	{
		this.role=role;
	}
	public void setCreatedAt(LocalDateTime createdAt)
	{
		this.createdAt=createdAt;
	}
	public int getId()
	{
		return id;
	}
	public String getUsername()
	{
		return username;
	}
	public String getEmail()
	{
		return email;
	}
	public String getPhone()
	{
		return phone;
	}
	public String getPassword()
	{
		return password;
	}
	public String getRole()
	{
		return role;
	}
	public LocalDateTime getCreatedAt()
	{
		return createdAt;
	}
	public void setAddress(String address) {
	    this.address = address;
	}

	public String getAddress() {
	    return address;
	}
}
