//
//  Vitals.swift
//  ApolloPatient
//
//  Created by Ranjith Kumar on 12/24/19.
//  Copyright © 2019 Facebook. All rights reserved.
//

import Foundation
import ApolloVitalsFramework
import JWTDecode

@objc(Vitals)
class Vitals: NSObject {
  @objc
  func vitalsToExport(_ token: String) -> Void {
    print("vitalsToExport")
    
    let vitaToken = String(format:"Open %@", token)
    UserDefaults.standard.set(vitaToken, forKey: "CONDITIONMANAGEMENT_VITA_TOKEN");
    
    #if DEVELOPMENT
    UserDefaults.standard.set("play", forKey: "environment")
    #else
    UserDefaults.standard.set("prod", forKey: "environment")
    #endif

    UserDefaults.standard.synchronize();
  }
  
//  @objc func goToReactNative() -> Void {
  @objc func goToReactNative(_ token: String) -> Void {
    print("goToReactNative")

   DispatchQueue.main.async {
    if let appDelegate = UIApplication.shared.delegate as? AppDelegate {
      let resourcesBundle = Bundle.init(identifier:"com.apollo.ApolloVitalsFramework")
//      print("goToReactNative",bundle as Any)

      let storyboard = UIStoryboard(name: "AV_Main", bundle: resourcesBundle)
//      let tabVc : UITabBarController = storyboard.instantiateViewController(withIdentifier: "TabBarController") as! UITabBarController
//      tabVc.modalPresentationStyle = .fullScreen;
//      appDelegate.window.rootViewController?.present(tabVc, animated: true, completion: nil);
      
      
      let jwt = try? decode(jwt: token as String)
      print("the data: \(jwt!.body)")
      let tokenBody = jwt!.body as? [String : Any]
      if tokenBody?["isActive"] as? Bool == false {
        let baseVC : PaymentViewController = storyboard.instantiateViewController(withIdentifier: "PaymentViewController") as! PaymentViewController
      baseVC.modalPresentationStyle = .fullScreen;
      appDelegate.window.rootViewController?.present(baseVC, animated: true, completion: nil);
      }
      else {
      let tabVc : TabBarController = storyboard.instantiateViewController(withIdentifier: "TabBarController") as! TabBarController
      tabVc.modalPresentationStyle = .fullScreen;
      appDelegate.window.rootViewController?.present(tabVc, animated: true, completion: nil);
      }
    }
   }
  }
}


// let vitaToken = "Open \("eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ2aXRhSWQiOiJ2aXRhSWRfMzY2OGYyNDYtZjZhNS00YmJkLWE5OGYtOTEzNDBiN2YzNWVkIiwicHJvdmlkZXJzIjp7InByb3ZpZGVySWRfZGExMWM0ZDQtMzExNi00MGJhLWI2NDEtMzM5MDA3NmFjMDA3Ijp7InByb3ZpZGVySWQiOiJwcm92aWRlcklkX2RhMTFjNGQ0LTMxMTYtNDBiYS1iNjQxLTMzOTAwNzZhYzAwNyIsIm5hbWUiOiJEZW1vIERvYyIsInJvbGUiOiJkb2N0b3IifSwicHJvdmlkZXJJZF84YjE1ODRmNC00NWM1LTQzNWItOGI2Ni00MTFjY2RlMzcxYWIiOnsicHJvdmlkZXJJZCI6InByb3ZpZGVySWRfOGIxNTg0ZjQtNDVjNS00MzViLThiNjYtNDExY2NkZTM3MWFiIiwibmFtZSI6IlRlc3QgQ29hY2giLCJyb2xlIjoiY29hY2gifSwicHJvdmlkZXJJZF9mY2QzM2FiNy01NWUxLTQxMjItOTUzMC02NmFlMzZiZWIyYmUiOnsicHJvdmlkZXJJZCI6InByb3ZpZGVySWRfZmNkMzNhYjctNTVlMS00MTIyLTk1MzAtNjZhZTM2YmViMmJlIiwibmFtZSI6IkhhcmkiLCJyb2xlIjoiZG9jdG9yIn19LCJwcm4iOiJ2aXRhSWRfMzY2OGYyNDYtZjZhNS00YmJkLWE5OGYtOTEzNDBiN2YzNWVkIiwiaWF0IjoxNTY4MjY4MjE1LCJleHAiOjk5OTk5OTk5OTksImlzcyI6IlZpdGFDbG91ZC1BVVRIIiwic3ViIjoiVml0YVRva2VuIn0.OgQdvqOJQeQGqlupI1N-ZLZLApYQMEiFrJtGJ_Be6P4")"
