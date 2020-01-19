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
    print("vitalsToExport", token)
    
    let vitaToken = String(format:"Open %@", token)
   UserDefaults.standard.set(vitaToken, forKey: "CONDITIONMANAGEMENT_VITA_TOKEN");
   
    #if DEVELOPMENT
    UserDefaults.standard.set("play", forKey: "environment")
    #else
    UserDefaults.standard.set("play", forKey: "environment")
    #endif
    UserDefaults.standard.set(true, forKey: "isComingFrom24x7")
//    UserDefaults.standard.set("prod", forKey: "environment")  while production enable it..

    UserDefaults.standard.synchronize();
  }
  
  @objc func goToReactNative(_ token: String) -> Void {
    print("goToReactNative", token)

   DispatchQueue.main.async {
    if let appDelegate = UIApplication.shared.delegate as? AppDelegate {
      let resourcesBundle = Bundle.init(identifier:"com.apollo.ApolloVitalsFramework")

      let storyboard = UIStoryboard(name: "AV_Main", bundle: resourcesBundle)

      // let storyboard = UIStoryboard(name: "AV_Main", bundle: nil)

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
